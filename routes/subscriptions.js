const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free Plan',
        price: 0,
        interval: 'forever',
        features: [
          'Basic fitness guidance',
          'Basic nutrition tips',
          'Weight tracking',
          'Limited AI coach messages',
          'Access to free workouts'
        ]
      },
      {
        id: 'premium',
        name: 'Premium Plan',
        price: 9.99,
        interval: 'month',
        stripePriceId: 'price_premium_monthly', // Replace with actual Stripe price ID
        features: [
          'Full AI Coach with personalized daily plans',
          'Advanced progress analysis',
          'Custom workout & meal plans',
          'Video-based workouts',
          'Priority reminders & motivation',
          'Long-term progress insights',
          'Access to exclusive content',
          'Unlimited AI coach messages'
        ]
      }
    ];

    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Server error fetching plans' });
  }
});

// Get current subscription
router.get('/current', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const subscription = {
      plan: user.subscription.plan,
      startDate: user.subscription.startDate,
      endDate: user.subscription.endDate,
      isActive: user.isPremium(),
      stripeCustomerId: user.subscription.stripeCustomerId,
      stripeSubscriptionId: user.subscription.stripeSubscriptionId
    };

    res.json({ subscription });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Server error fetching subscription' });
  }
});

// Create Stripe checkout session
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { planId } = req.body;
    
    if (planId !== 'premium') {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create or get Stripe customer
    let customerId = user.subscription.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.profile.name,
        metadata: {
          userId: user._id.toString()
        }
      });
      customerId = customer.id;
      
      // Update user with customer ID
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_premium_monthly', // Replace with actual Stripe price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/subscription/cancel`,
      metadata: {
        userId: user._id.toString(),
        planId: planId
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ message: 'Server error creating checkout session' });
  }
});

// Handle successful subscription
router.post('/success', auth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.metadata.userId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get the subscription
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // Update user subscription
    const user = await User.findById(req.userId);
    user.subscription.plan = 'premium';
    user.subscription.startDate = new Date(subscription.current_period_start * 1000);
    user.subscription.endDate = new Date(subscription.current_period_end * 1000);
    user.subscription.stripeSubscriptionId = subscription.id;
    
    await user.save();

    res.json({
      message: 'Subscription activated successfully!',
      subscription: {
        plan: user.subscription.plan,
        startDate: user.subscription.startDate,
        endDate: user.subscription.endDate,
        isActive: true
      }
    });
  } catch (error) {
    console.error('Subscription success error:', error);
    res.status(500).json({ message: 'Server error processing subscription' });
  }
});

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.subscription.stripeSubscriptionId) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Cancel the subscription at period end
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    res.json({
      message: 'Subscription will be cancelled at the end of the current billing period',
      endDate: user.subscription.endDate
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error cancelling subscription' });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      
      // Find user by customer ID
      const user = await User.findOne({ 'subscription.stripeCustomerId': subscription.customer });
      
      if (user) {
        if (subscription.status === 'active') {
          user.subscription.plan = 'premium';
          user.subscription.startDate = new Date(subscription.current_period_start * 1000);
          user.subscription.endDate = new Date(subscription.current_period_end * 1000);
        } else {
          user.subscription.plan = 'free';
          user.subscription.endDate = null;
        }
        
        await user.save();
      }
      break;

    case 'invoice.payment_failed':
      // Handle failed payment
      const invoice = event.data.object;
      console.log('Payment failed for customer:', invoice.customer);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
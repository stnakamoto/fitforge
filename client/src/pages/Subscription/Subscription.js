import React, { useState, useEffect } from 'react';
import { Check, Crown, Zap, Star, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Subscription.css';

const Subscription = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      const response = await axios.get('/api/subscriptions/current');
      setCurrentPlan(response.data);
    } catch (error) {
      console.error('Error fetching current plan:', error);
    }
  };

  const handleSubscribe = async (planId) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/subscriptions/create', {
        planId
      });
      
      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started with your fitness journey',
      features: [
        'Basic workout library',
        'Progress tracking',
        'Community access',
        'Mobile app access'
      ],
      limitations: [
        'Limited AI coach interactions',
        'Basic nutrition tracking',
        'Standard support'
      ],
      icon: <Users className="plan-icon" />,
      color: 'free'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 9.99,
      period: 'month',
      description: 'Unlock advanced features and personalized coaching',
      features: [
        'Full workout library',
        'Unlimited AI coach',
        'Advanced nutrition tracking',
        'Custom workout plans',
        'Progress analytics',
        'Priority support',
        'Offline mode'
      ],
      popular: true,
      icon: <Star className="plan-icon" />,
      color: 'premium'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      period: 'month',
      description: 'For serious athletes and fitness enthusiasts',
      features: [
        'Everything in Premium',
        'Personal trainer consultations',
        'Advanced biometric tracking',
        'Meal planning & recipes',
        'Video form analysis',
        'Competition tracking',
        'White-label access'
      ],
      icon: <Crown className="plan-icon" />,
      color: 'pro'
    }
  ];

  const isCurrentPlan = (planId) => {
    return currentPlan?.planId === planId;
  };

  const getPlanStatus = (planId) => {
    if (isCurrentPlan(planId)) {
      return currentPlan?.status === 'active' ? 'Current Plan' : 'Inactive';
    }
    return null;
  };

  return (
    <div className="subscription-container">
      <div className="subscription-header">
        <h1>Choose Your Plan</h1>
        <p>Unlock your full potential with FitForge Premium features</p>
        
        {currentPlan && (
          <div className="current-plan-info">
            <div className="plan-status">
              <Zap className="status-icon" />
              <span>
                Current Plan: <strong>{currentPlan.planName}</strong>
                {currentPlan.status === 'active' && currentPlan.nextBilling && (
                  <span className="billing-info">
                    • Next billing: {new Date(currentPlan.nextBilling).toLocaleDateString()}
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="plans-grid">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`plan-card ${plan.color} ${plan.popular ? 'popular' : ''} ${isCurrentPlan(plan.id) ? 'current' : ''}`}
          >
            {plan.popular && (
              <div className="popular-badge">
                <Star className="badge-icon" />
                Most Popular
              </div>
            )}
            
            <div className="plan-header">
              <div className="plan-icon-container">
                {plan.icon}
              </div>
              <h3>{plan.name}</h3>
              <div className="plan-price">
                <span className="currency">$</span>
                <span className="amount">{plan.price}</span>
                <span className="period">/{plan.period}</span>
              </div>
              <p className="plan-description">{plan.description}</p>
            </div>

            <div className="plan-features">
              <h4>What's included:</h4>
              <ul className="features-list">
                {plan.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <Check className="check-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {plan.limitations && (
                <div className="limitations">
                  <h4>Limitations:</h4>
                  <ul className="limitations-list">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="limitation-item">
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="plan-action">
              {isCurrentPlan(plan.id) ? (
                <button className="btn-current" disabled>
                  {getPlanStatus(plan.id)}
                </button>
              ) : (
                <button 
                  className={`btn-subscribe ${plan.color}`}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 
                   plan.id === 'free' ? 'Current Plan' : 
                   `Subscribe to ${plan.name}`}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="subscription-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>Can I cancel anytime?</h3>
            <p>Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.</p>
          </div>
          
          <div className="faq-item">
            <h3>What payment methods do you accept?</h3>
            <p>We accept all major credit cards, PayPal, and other payment methods through our secure payment processor Stripe.</p>
          </div>
          
          <div className="faq-item">
            <h3>Is there a free trial?</h3>
            <p>Yes! All premium plans come with a 7-day free trial. You can cancel before the trial ends without being charged.</p>
          </div>
          
          <div className="faq-item">
            <h3>Can I change my plan later?</h3>
            <p>Absolutely! You can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.</p>
          </div>
        </div>
      </div>

      <div className="subscription-footer">
        <div className="security-badges">
          <div className="badge">
            <Check className="badge-icon" />
            <span>30-day money-back guarantee</span>
          </div>
          <div className="badge">
            <Check className="badge-icon" />
            <span>Secure payment processing</span>
          </div>
          <div className="badge">
            <Check className="badge-icon" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
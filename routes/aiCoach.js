const express = require('express');
const { AIMessage, CoachingInsight, UserInteraction } = require('../models/AICoach');
const { Workout } = require('../models/Workout');
const { NutritionTip } = require('../models/Nutrition');
const User = require('../models/User');
const { auth, premiumAuth } = require('../middleware/auth');

const router = express.Router();

// AI Coach service for generating personalized messages
class AICoachService {
  static generateMotivationalMessage(user, context = {}) {
    const messages = {
      'build-muscle': [
        "💪 Every rep counts! Your muscles are getting stronger with each workout.",
        "🔥 Consistency is key to building the physique you want. Keep pushing!",
        "⚡ Your dedication to muscle building is inspiring. Time to crush today's workout!"
      ],
      'lose-weight': [
        "🎯 You're making great progress! Every healthy choice brings you closer to your goal.",
        "🌟 Remember, sustainable weight loss is a journey. You're doing amazing!",
        "💚 Your commitment to a healthier lifestyle is paying off. Keep it up!"
      ],
      'improve-endurance': [
        "🏃‍♀️ Your endurance is building day by day. Feel that strength growing!",
        "⚡ Push through the challenge - your cardiovascular system is getting stronger!",
        "🎯 Every minute of cardio is an investment in your long-term health."
      ],
      'general-health': [
        "🌈 Taking care of your health is the best gift you can give yourself.",
        "💪 Small consistent actions lead to big health improvements. You're on the right track!",
        "✨ Your body appreciates every healthy choice you make. Keep going!"
      ]
    };

    const goalMessages = messages[user.goals.primary] || messages['general-health'];
    return goalMessages[Math.floor(Math.random() * goalMessages.length)];
  }

  static generateWorkoutSuggestion(user) {
    const suggestions = {
      'build-muscle': {
        title: "Strength Training Focus",
        message: "Based on your muscle-building goal, try a compound movement workout today. Focus on progressive overload with exercises like squats, deadlifts, and bench press."
      },
      'lose-weight': {
        title: "Cardio + Strength Combo",
        message: "Combine cardio with strength training for optimal fat burning. Try a 20-minute HIIT session followed by bodyweight exercises."
      },
      'improve-endurance': {
        title: "Endurance Building Session",
        message: "Time for an endurance-focused workout! Try interval training or a steady-state cardio session to build your cardiovascular capacity."
      },
      'improve-flexibility': {
        title: "Flexibility & Mobility",
        message: "Don't forget about flexibility! A good stretching or yoga session will improve your range of motion and prevent injuries."
      }
    };

    return suggestions[user.goals.primary] || suggestions['improve-endurance'];
  }

  static generateNutritionTip(user) {
    const tips = {
      'build-muscle': {
        title: "Protein Power",
        message: "Aim for 1.6-2.2g of protein per kg of body weight to support muscle growth. Include lean meats, eggs, dairy, and plant-based proteins in your meals."
      },
      'lose-weight': {
        title: "Calorie Awareness",
        message: "Focus on nutrient-dense, lower-calorie foods. Fill half your plate with vegetables, and choose lean proteins and complex carbs."
      },
      'general-health': {
        title: "Balanced Nutrition",
        message: "Eat the rainbow! Include a variety of colorful fruits and vegetables to ensure you're getting diverse nutrients and antioxidants."
      }
    };

    return tips[user.goals.primary] || tips['general-health'];
  }

  static calculateProgressInsight(user) {
    const insights = [];
    
    // Weight progress analysis
    if (user.progress.weightHistory.length >= 2) {
      const recent = user.progress.weightHistory.slice(-7); // Last 7 entries
      const trend = recent[recent.length - 1].weight - recent[0].weight;
      
      if (user.goals.primary === 'lose-weight' && trend < 0) {
        insights.push("Great job! You're trending in the right direction with your weight loss goal.");
      } else if (user.goals.primary === 'build-muscle' && trend > 0) {
        insights.push("Your weight is increasing, which could indicate muscle gain. Keep monitoring your progress!");
      }
    }

    // Workout consistency
    if (user.progress.streakDays >= 7) {
      insights.push(`Amazing! You've maintained a ${user.progress.streakDays}-day workout streak. Consistency is key to success!`);
    }

    return insights;
  }
}

// Get AI coach messages
router.get('/messages', auth, async (req, res) => {
  try {
    const { limit = 10, unreadOnly = false } = req.query;
    
    const query = { userId: req.userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const messages = await AIMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('relatedData.workoutId', 'title duration')
      .populate('relatedData.nutritionTipId', 'title');

    res.json({ messages });
  } catch (error) {
    console.error('Get AI messages error:', error);
    res.status(500).json({ message: 'Server error fetching AI messages' });
  }
});

// Mark message as read
router.put('/messages/:messageId/read', auth, async (req, res) => {
  try {
    const message = await AIMessage.findOneAndUpdate(
      { _id: req.params.messageId, userId: req.userId },
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ message: 'Server error marking message as read' });
  }
});

// Get daily coaching
router.get('/daily-coaching', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has premium for full coaching
    const isPremium = user.isPremium();
    
    // Generate daily coaching content
    const coaching = {
      motivationalMessage: AICoachService.generateMotivationalMessage(user),
      workoutSuggestion: AICoachService.generateWorkoutSuggestion(user),
      nutritionTip: AICoachService.generateNutritionTip(user),
      progressInsights: AICoachService.calculateProgressInsight(user),
      isPremium: isPremium
    };

    // Limit content for free users
    if (!isPremium) {
      coaching.workoutSuggestion = {
        title: "Upgrade for Personalized Plans",
        message: "Get premium for fully personalized daily workout recommendations based on your progress and preferences."
      };
      coaching.progressInsights = coaching.progressInsights.slice(0, 1); // Limit insights
    }

    res.json({ coaching });
  } catch (error) {
    console.error('Daily coaching error:', error);
    res.status(500).json({ message: 'Server error generating daily coaching' });
  }
});

// Get personalized workout recommendations
router.get('/workout-recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build query based on user preferences
    const query = {
      targetGoals: user.goals.primary,
      $or: [
        { isPremium: false },
        { isPremium: true, $expr: { $eq: [user.isPremium(), true] } }
      ]
    };

    // Add sports categories filter
    if (user.preferences.sports && user.preferences.sports.length > 0) {
      query.sportsCategories = { $in: user.preferences.sports };
    }

    // Add duration filter
    if (user.preferences.workoutDuration) {
      query.duration = { $lte: user.preferences.workoutDuration + 15 }; // Allow 15min flexibility
    }

    const workouts = await Workout.find(query)
      .limit(user.isPremium() ? 10 : 3) // Limit for free users
      .sort({ createdAt: -1 });

    res.json({ 
      workouts,
      isPremium: user.isPremium(),
      message: user.isPremium() ? null : "Upgrade to premium for unlimited personalized workout recommendations!"
    });
  } catch (error) {
    console.error('Workout recommendations error:', error);
    res.status(500).json({ message: 'Server error getting workout recommendations' });
  }
});

// Log user interaction for AI learning
router.post('/interaction', auth, async (req, res) => {
  try {
    const { interactionType, data, response, sentiment } = req.body;

    const interaction = new UserInteraction({
      userId: req.userId,
      interactionType,
      data,
      response,
      sentiment
    });

    await interaction.save();

    res.json({ message: 'Interaction logged successfully' });
  } catch (error) {
    console.error('Log interaction error:', error);
    res.status(500).json({ message: 'Server error logging interaction' });
  }
});

// Get coaching insights (Premium feature)
router.get('/insights', premiumAuth, async (req, res) => {
  try {
    const insights = await CoachingInsight.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ insights });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ message: 'Server error fetching insights' });
  }
});

module.exports = router;
const express = require('express');
const { NutritionTip, MealPlan, FoodLog } = require('../models/Nutrition');
const User = require('../models/User');
const { auth, premiumAuth } = require('../middleware/auth');

const router = express.Router();

// Get nutrition tips
router.get('/tips', auth, async (req, res) => {
  try {
    const { category, goal, page = 1, limit = 10 } = req.query;
    
    const user = await User.findById(req.userId);
    const isPremium = user.isPremium();

    // Build query
    const query = {
      $or: [
        { isPremium: false },
        { isPremium: true, $expr: { $eq: [isPremium, true] } }
      ]
    };

    if (category) query.category = category;
    if (goal) query.targetGoals = goal;

    const tips = await NutritionTip.find(query)
      .populate('createdBy', 'profile.name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await NutritionTip.countDocuments(query);

    res.json({
      tips,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      },
      isPremium
    });
  } catch (error) {
    console.error('Get nutrition tips error:', error);
    res.status(500).json({ message: 'Server error fetching nutrition tips' });
  }
});

// Get single nutrition tip
router.get('/tips/:id', auth, async (req, res) => {
  try {
    const tip = await NutritionTip.findById(req.params.id)
      .populate('createdBy', 'profile.name');

    if (!tip) {
      return res.status(404).json({ message: 'Nutrition tip not found' });
    }

    // Check premium access
    const user = await User.findById(req.userId);
    if (tip.isPremium && !user.isPremium()) {
      return res.status(403).json({ 
        message: 'Premium subscription required for this content',
        isPremium: false
      });
    }

    res.json({ tip });
  } catch (error) {
    console.error('Get nutrition tip error:', error);
    res.status(500).json({ message: 'Server error fetching nutrition tip' });
  }
});

// Get meal plans
router.get('/meal-plans', auth, async (req, res) => {
  try {
    const { goal, calories, page = 1, limit = 10 } = req.query;
    
    const user = await User.findById(req.userId);
    const isPremium = user.isPremium();

    // Build query
    const query = {
      $or: [
        { isPremium: false },
        { isPremium: true, $expr: { $eq: [isPremium, true] } }
      ]
    };

    if (goal) query.targetGoal = goal;
    if (calories) {
      const calorieRange = parseInt(calories);
      query.caloriesPerDay = { 
        $gte: calorieRange - 200, 
        $lte: calorieRange + 200 
      };
    }

    const mealPlans = await MealPlan.find(query)
      .populate('createdBy', 'profile.name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await MealPlan.countDocuments(query);

    res.json({
      mealPlans,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      },
      isPremium
    });
  } catch (error) {
    console.error('Get meal plans error:', error);
    res.status(500).json({ message: 'Server error fetching meal plans' });
  }
});

// Get single meal plan
router.get('/meal-plans/:id', auth, async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id)
      .populate('createdBy', 'profile.name');

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    // Check premium access
    const user = await User.findById(req.userId);
    if (mealPlan.isPremium && !user.isPremium()) {
      return res.status(403).json({ 
        message: 'Premium subscription required for this meal plan',
        isPremium: false
      });
    }

    res.json({ mealPlan });
  } catch (error) {
    console.error('Get meal plan error:', error);
    res.status(500).json({ message: 'Server error fetching meal plan' });
  }
});

// Log food intake
router.post('/food-log', auth, async (req, res) => {
  try {
    const { date, meals, totalCalories, waterIntake, notes } = req.body;

    // Check if log already exists for this date
    const existingLog = await FoodLog.findOne({
      userId: req.userId,
      date: new Date(date)
    });

    if (existingLog) {
      // Update existing log
      existingLog.meals = meals;
      existingLog.totalCalories = totalCalories;
      existingLog.waterIntake = waterIntake;
      existingLog.notes = notes;
      await existingLog.save();

      res.json({
        message: 'Food log updated successfully',
        foodLog: existingLog
      });
    } else {
      // Create new log
      const foodLog = new FoodLog({
        userId: req.userId,
        date: new Date(date),
        meals,
        totalCalories,
        waterIntake,
        notes
      });

      await foodLog.save();

      res.status(201).json({
        message: 'Food log created successfully',
        foodLog
      });
    }

    // Update user's daily tracking
    const user = await User.findById(req.userId);
    user.dailyTracking.caloriesConsumed = totalCalories;
    user.dailyTracking.waterIntake = waterIntake;
    await user.save();

  } catch (error) {
    console.error('Food log error:', error);
    res.status(500).json({ message: 'Server error logging food intake' });
  }
});

// Get food logs
router.get('/food-logs', auth, async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    const query = { userId: req.userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const foodLogs = await FoodLog.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await FoodLog.countDocuments(query);

    res.json({
      foodLogs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get food logs error:', error);
    res.status(500).json({ message: 'Server error fetching food logs' });
  }
});

// Get nutrition recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate basic nutritional needs based on user profile
    const { weight, height, age, gender, activityLevel } = user.profile;
    const { primary: goal } = user.goals;

    let bmr = 0;
    if (weight && height && age && gender) {
      // Harris-Benedict Equation
      if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
      } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
      }

      // Activity multiplier
      const activityMultipliers = {
        'sedentary': 1.2,
        'lightly-active': 1.375,
        'moderately-active': 1.55,
        'very-active': 1.725,
        'extremely-active': 1.9
      };

      const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

      // Adjust calories based on goal
      let targetCalories = tdee;
      if (goal === 'lose-weight') {
        targetCalories = tdee - 500; // 500 calorie deficit
      } else if (goal === 'build-muscle') {
        targetCalories = tdee + 300; // 300 calorie surplus
      }

      // Calculate macros
      const proteinGrams = weight * (goal === 'build-muscle' ? 2.2 : 1.6);
      const fatGrams = (targetCalories * 0.25) / 9; // 25% of calories from fat
      const carbGrams = (targetCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4;

      const recommendations = {
        dailyCalories: Math.round(targetCalories),
        macros: {
          protein: Math.round(proteinGrams),
          carbs: Math.round(carbGrams),
          fats: Math.round(fatGrams)
        },
        waterIntake: Math.round(weight * 35), // ml per day
        mealsPerDay: 3,
        tips: [
          `Aim for ${Math.round(targetCalories)} calories per day based on your ${goal} goal`,
          `Include ${Math.round(proteinGrams)}g of protein daily to support your fitness goals`,
          `Drink at least ${Math.round(weight * 35)}ml of water daily`,
          'Focus on whole foods and minimize processed foods',
          'Eat protein with every meal to maintain muscle mass'
        ]
      };

      res.json({ recommendations });
    } else {
      res.json({
        message: 'Complete your profile to get personalized nutrition recommendations',
        basicTips: [
          'Eat a balanced diet with plenty of vegetables',
          'Stay hydrated throughout the day',
          'Include protein in every meal',
          'Choose whole grains over refined carbs',
          'Limit processed foods and added sugars'
        ]
      });
    }
  } catch (error) {
    console.error('Get nutrition recommendations error:', error);
    res.status(500).json({ message: 'Server error generating recommendations' });
  }
});

module.exports = router;
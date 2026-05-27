const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Complete onboarding
router.post('/onboarding', auth, async (req, res) => {
  try {
    const {
      age,
      gender,
      height,
      weight,
      activityLevel,
      primaryGoal,
      targetWeight,
      timeline,
      sports,
      workoutDuration,
      workoutFrequency,
      dietaryRestrictions
    } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile
    user.profile.age = age;
    user.profile.gender = gender;
    user.profile.height = height;
    user.profile.weight = weight;
    user.profile.activityLevel = activityLevel;

    // Update goals
    user.goals.primary = primaryGoal;
    user.goals.targetWeight = targetWeight;
    user.goals.timeline = timeline;

    // Update preferences
    user.preferences.sports = sports || [];
    user.preferences.workoutDuration = workoutDuration || 45;
    user.preferences.workoutFrequency = workoutFrequency || 3;
    user.preferences.dietaryRestrictions = dietaryRestrictions || [];

    // Initialize weight history
    if (weight) {
      user.progress.weightHistory = [{
        weight: weight,
        date: new Date()
      }];
    }

    await user.save();

    res.json({
      message: 'Onboarding completed successfully',
      user: {
        id: user._id,
        profile: user.profile,
        goals: user.goals,
        preferences: user.preferences,
        onboardingComplete: true
      }
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ message: 'Server error during onboarding' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    const allowedUpdates = ['profile', 'goals', 'preferences', 'dailyTracking'];
    
    allowedUpdates.forEach(field => {
      if (updates[field]) {
        user[field] = { ...user[field].toObject(), ...updates[field] };
      }
    });

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        profile: user.profile,
        goals: user.goals,
        preferences: user.preferences,
        dailyTracking: user.dailyTracking
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Log weight
router.post('/weight', auth, async (req, res) => {
  try {
    const { weight } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update current weight
    user.profile.weight = weight;
    
    // Add to weight history
    user.progress.weightHistory.push({
      weight: weight,
      date: new Date()
    });

    // Keep only last 100 entries
    if (user.progress.weightHistory.length > 100) {
      user.progress.weightHistory = user.progress.weightHistory.slice(-100);
    }

    await user.save();

    res.json({
      message: 'Weight logged successfully',
      currentWeight: weight,
      weightHistory: user.progress.weightHistory.slice(-10) // Return last 10 entries
    });
  } catch (error) {
    console.error('Weight logging error:', error);
    res.status(500).json({ message: 'Server error logging weight' });
  }
});

// Update daily tracking
router.post('/daily-tracking', auth, async (req, res) => {
  try {
    const { waterIntake, sleepHours, stepsCount, caloriesConsumed } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update daily tracking data
    if (waterIntake !== undefined) user.dailyTracking.waterIntake = waterIntake;
    if (sleepHours !== undefined) user.dailyTracking.sleepHours = sleepHours;
    if (stepsCount !== undefined) user.dailyTracking.stepsCount = stepsCount;
    if (caloriesConsumed !== undefined) user.dailyTracking.caloriesConsumed = caloriesConsumed;

    await user.save();

    res.json({
      message: 'Daily tracking updated successfully',
      dailyTracking: user.dailyTracking
    });
  } catch (error) {
    console.error('Daily tracking error:', error);
    res.status(500).json({ message: 'Server error updating daily tracking' });
  }
});

// Get user progress
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const progress = {
      currentWeight: user.profile.weight,
      targetWeight: user.goals.targetWeight,
      weightHistory: user.progress.weightHistory.slice(-30), // Last 30 entries
      workoutsCompleted: user.progress.workoutsCompleted,
      totalWorkoutTime: user.progress.totalWorkoutTime,
      streakDays: user.progress.streakDays,
      lastWorkoutDate: user.progress.lastWorkoutDate,
      dailyTracking: user.dailyTracking
    };

    res.json({ progress });
  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({ message: 'Server error fetching progress' });
  }
});

// Get user stats for dashboard
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate weekly workouts (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { WorkoutSession } = require('../models/Workout');
    const weeklyWorkouts = await WorkoutSession.countDocuments({
      userId: req.userId,
      completedAt: { $gte: weekAgo }
    });

    // Calculate total calories burned (estimate based on workout time)
    const totalCaloriesBurned = Math.round(user.progress.totalWorkoutTime * 8); // ~8 calories per minute

    const stats = {
      totalWorkouts: user.progress.workoutsCompleted || 0,
      weeklyWorkouts: weeklyWorkouts || 0,
      currentStreak: user.progress.streakDays || 0,
      totalCaloriesBurned: totalCaloriesBurned || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

module.exports = router;
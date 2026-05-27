const express = require('express');
const multer = require('multer');
const path = require('path');
const { Workout } = require('../models/Workout');
const { NutritionTip, MealPlan } = require('../models/Nutrition');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Dashboard analytics
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ 'subscription.plan': 'premium' });
    const freeUsers = totalUsers - premiumUsers;
    
    const activeUsers = await User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    const totalWorkouts = await Workout.countDocuments();
    const premiumWorkouts = await Workout.countDocuments({ isPremium: true });
    
    const totalNutritionTips = await NutritionTip.countDocuments();
    const totalMealPlans = await MealPlan.countDocuments();

    // Recent user registrations (last 7 days)
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Subscription conversion rate
    const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(2) : 0;

    res.json({
      analytics: {
        users: {
          total: totalUsers,
          premium: premiumUsers,
          free: freeUsers,
          active: activeUsers,
          recentSignups: recentUsers,
          conversionRate: parseFloat(conversionRate)
        },
        content: {
          totalWorkouts,
          premiumWorkouts,
          freeWorkouts: totalWorkouts - premiumWorkouts,
          nutritionTips: totalNutritionTips,
          mealPlans: totalMealPlans
        }
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

// Get all users with pagination
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', plan = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.name': { $regex: search, $options: 'i' } }
      ];
    }
    if (plan) {
      query['subscription.plan'] = plan;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Create workout
router.post('/workouts', adminAuth, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      duration,
      exercises,
      targetGoals,
      sportsCategories,
      equipment,
      caloriesBurned,
      isPremium
    } = req.body;

    const workout = new Workout({
      title,
      description,
      category,
      difficulty,
      duration: parseInt(duration),
      exercises: JSON.parse(exercises || '[]'),
      targetGoals: JSON.parse(targetGoals || '[]'),
      sportsCategories: JSON.parse(sportsCategories || '[]'),
      equipment: JSON.parse(equipment || '[]'),
      caloriesBurned: parseInt(caloriesBurned) || 0,
      isPremium: isPremium === 'true',
      createdBy: req.userId
    });

    // Handle file uploads
    if (req.files.thumbnail) {
      workout.thumbnailUrl = `/uploads/${req.files.thumbnail[0].filename}`;
    }
    if (req.files.video) {
      workout.videoUrl = `/uploads/${req.files.video[0].filename}`;
    }

    await workout.save();

    res.status(201).json({
      message: 'Workout created successfully',
      workout
    });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ message: 'Server error creating workout' });
  }
});

// Update workout
router.put('/workouts/:id', adminAuth, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Parse JSON fields
    if (updates.exercises) updates.exercises = JSON.parse(updates.exercises);
    if (updates.targetGoals) updates.targetGoals = JSON.parse(updates.targetGoals);
    if (updates.sportsCategories) updates.sportsCategories = JSON.parse(updates.sportsCategories);
    if (updates.equipment) updates.equipment = JSON.parse(updates.equipment);
    
    // Convert string booleans
    if (updates.isPremium) updates.isPremium = updates.isPremium === 'true';
    
    // Convert numbers
    if (updates.duration) updates.duration = parseInt(updates.duration);
    if (updates.caloriesBurned) updates.caloriesBurned = parseInt(updates.caloriesBurned);

    // Handle file uploads
    if (req.files.thumbnail) {
      updates.thumbnailUrl = `/uploads/${req.files.thumbnail[0].filename}`;
    }
    if (req.files.video) {
      updates.videoUrl = `/uploads/${req.files.video[0].filename}`;
    }

    updates.updatedAt = new Date();

    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({
      message: 'Workout updated successfully',
      workout
    });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ message: 'Server error updating workout' });
  }
});

// Delete workout
router.delete('/workouts/:id', adminAuth, async (req, res) => {
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ message: 'Server error deleting workout' });
  }
});

// Create nutrition tip
router.post('/nutrition-tips', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category, targetGoals, isPremium } = req.body;

    const nutritionTip = new NutritionTip({
      title,
      content,
      category,
      targetGoals: JSON.parse(targetGoals || '[]'),
      isPremium: isPremium === 'true',
      createdBy: req.userId
    });

    if (req.file) {
      nutritionTip.imageUrl = `/uploads/${req.file.filename}`;
    }

    await nutritionTip.save();

    res.status(201).json({
      message: 'Nutrition tip created successfully',
      nutritionTip
    });
  } catch (error) {
    console.error('Create nutrition tip error:', error);
    res.status(500).json({ message: 'Server error creating nutrition tip' });
  }
});

// Get all content for management
router.get('/content', adminAuth, async (req, res) => {
  try {
    const { type = 'all', page = 1, limit = 20 } = req.query;

    let content = [];
    let total = 0;

    if (type === 'workouts' || type === 'all') {
      const workouts = await Workout.find()
        .populate('createdBy', 'profile.name')
        .sort({ createdAt: -1 })
        .limit(type === 'all' ? 10 : parseInt(limit))
        .skip(type === 'all' ? 0 : (parseInt(page) - 1) * parseInt(limit));
      
      content.push(...workouts.map(w => ({ ...w.toObject(), contentType: 'workout' })));
      
      if (type === 'workouts') {
        total = await Workout.countDocuments();
      }
    }

    if (type === 'nutrition' || type === 'all') {
      const nutritionTips = await NutritionTip.find()
        .populate('createdBy', 'profile.name')
        .sort({ createdAt: -1 })
        .limit(type === 'all' ? 10 : parseInt(limit))
        .skip(type === 'all' ? 0 : (parseInt(page) - 1) * parseInt(limit));
      
      content.push(...nutritionTips.map(n => ({ ...n.toObject(), contentType: 'nutrition' })));
      
      if (type === 'nutrition') {
        total = await NutritionTip.countDocuments();
      }
    }

    // Sort by creation date if showing all
    if (type === 'all') {
      content.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      total = content.length;
    }

    res.json({
      content,
      pagination: type === 'all' ? null : {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error fetching content' });
  }
});

module.exports = router;
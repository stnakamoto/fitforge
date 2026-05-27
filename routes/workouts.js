const express = require('express');
const { Workout, WorkoutSession } = require('../models/Workout');
const User = require('../models/User');
const { auth, premiumAuth } = require('../middleware/auth');

const router = express.Router();

// Get workouts with filtering
router.get('/', auth, async (req, res) => {
  try {
    const { 
      category, 
      difficulty, 
      goal, 
      sport, 
      duration, 
      equipment,
      page = 1, 
      limit = 10 
    } = req.query;

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
    if (difficulty) query.difficulty = difficulty;
    if (goal) query.targetGoals = goal;
    if (sport) query.sportsCategories = sport;
    if (duration) query.duration = { $lte: parseInt(duration) };
    if (equipment) query.equipment = { $in: equipment.split(',') };

    const workouts = await Workout.find(query)
      .populate('createdBy', 'profile.name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Workout.countDocuments(query);

    res.json({
      workouts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      },
      isPremium
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ message: 'Server error fetching workouts' });
  }
});

// Get single workout
router.get('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id)
      .populate('createdBy', 'profile.name');

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Check premium access
    const user = await User.findById(req.userId);
    if (workout.isPremium && !user.isPremium()) {
      return res.status(403).json({ 
        message: 'Premium subscription required for this workout',
        isPremium: false
      });
    }

    res.json({ workout });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ message: 'Server error fetching workout' });
  }
});

// Start workout session
router.post('/:id/start', auth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Check premium access
    const user = await User.findById(req.userId);
    if (workout.isPremium && !user.isPremium()) {
      return res.status(403).json({ message: 'Premium subscription required' });
    }

    // Create workout session
    const session = new WorkoutSession({
      userId: req.userId,
      workoutId: workout._id,
      completedExercises: workout.exercises.map(exercise => ({
        exerciseId: exercise._id,
        actualSets: 0,
        actualReps: [],
        actualWeight: [],
        completed: false
      }))
    });

    await session.save();

    res.json({
      message: 'Workout session started',
      sessionId: session._id,
      workout: {
        id: workout._id,
        title: workout.title,
        duration: workout.duration,
        exercises: workout.exercises
      }
    });
  } catch (error) {
    console.error('Start workout error:', error);
    res.status(500).json({ message: 'Server error starting workout' });
  }
});

// Complete workout session
router.post('/sessions/:sessionId/complete', auth, async (req, res) => {
  try {
    const { completedExercises, duration, caloriesBurned, difficulty, notes } = req.body;

    const session = await WorkoutSession.findOneAndUpdate(
      { _id: req.params.sessionId, userId: req.userId },
      {
        completedExercises,
        duration,
        caloriesBurned,
        difficulty,
        notes,
        completedAt: new Date()
      },
      { new: true }
    ).populate('workoutId', 'title category');

    if (!session) {
      return res.status(404).json({ message: 'Workout session not found' });
    }

    // Update user progress
    const user = await User.findById(req.userId);
    user.progress.workoutsCompleted += 1;
    user.progress.totalWorkoutTime += duration || 0;
    user.progress.lastWorkoutDate = new Date();

    // Update streak
    const today = new Date();
    const lastWorkout = user.progress.lastWorkoutDate;
    const daysDiff = Math.floor((today - lastWorkout) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) {
      user.progress.streakDays += 1;
    } else {
      user.progress.streakDays = 1;
    }

    await user.save();

    res.json({
      message: 'Workout completed successfully!',
      session,
      progress: {
        workoutsCompleted: user.progress.workoutsCompleted,
        totalWorkoutTime: user.progress.totalWorkoutTime,
        streakDays: user.progress.streakDays
      }
    });
  } catch (error) {
    console.error('Complete workout error:', error);
    res.status(500).json({ message: 'Server error completing workout' });
  }
});

// Get user's workout history
router.get('/user/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const sessions = await WorkoutSession.find({ userId: req.userId })
      .populate('workoutId', 'title category duration')
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await WorkoutSession.countDocuments({ userId: req.userId });

    res.json({
      sessions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get workout history error:', error);
    res.status(500).json({ message: 'Server error fetching workout history' });
  }
});

// Get workout categories and filters
router.get('/meta/filters', auth, async (req, res) => {
  try {
    const categories = await Workout.distinct('category');
    const difficulties = await Workout.distinct('difficulty');
    const equipment = await Workout.distinct('equipment');
    const sportsCategories = await Workout.distinct('sportsCategories');

    res.json({
      categories,
      difficulties,
      equipment: equipment.flat(),
      sportsCategories: sportsCategories.flat(),
      goals: ['build-muscle', 'lose-weight', 'maintain-weight', 'improve-endurance', 'improve-flexibility', 'general-health']
    });
  } catch (error) {
    console.error('Get filters error:', error);
    res.status(500).json({ message: 'Server error fetching filters' });
  }
});

// Get recent workouts for dashboard
router.get('/recent', auth, async (req, res) => {
  try {
    const recentSessions = await WorkoutSession.find({ userId: req.userId })
      .populate('workoutId', 'title category duration')
      .sort({ completedAt: -1 })
      .limit(5);

    const recentWorkouts = recentSessions.map(session => ({
      _id: session._id,
      name: session.workoutId?.title || 'Unknown Workout',
      type: session.workoutId?.category || 'General',
      duration: session.duration || session.workoutId?.duration || 0,
      completedAt: session.completedAt
    }));

    res.json(recentWorkouts);
  } catch (error) {
    console.error('Get recent workouts error:', error);
    res.status(500).json({ message: 'Server error fetching recent workouts' });
  }
});

module.exports = router;
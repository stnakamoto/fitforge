const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: String, required: true }, // e.g., "10-12", "30 seconds"
  weight: { type: Number }, // in kg
  restTime: { type: Number }, // seconds
  instructions: { type: String },
  targetMuscles: [String],
  equipment: { type: String }
});

const workoutSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'endurance', 'sports-specific'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  duration: { type: Number, required: true }, // minutes
  exercises: [exerciseSchema],
  targetGoals: [{
    type: String,
    enum: ['build-muscle', 'lose-weight', 'maintain-weight', 'improve-endurance', 'improve-flexibility', 'general-health']
  }],
  sportsCategories: [{
    type: String,
    enum: ['gym-training', 'calisthenics', 'athletics', 'cardio-sports', 'yoga-stretching', 'team-sports']
  }],
  equipment: [String],
  caloriesBurned: { type: Number }, // estimated calories per session
  videoUrl: { type: String },
  thumbnailUrl: { type: String },
  isPremium: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User workout session tracking
const workoutSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout', required: true },
  completedExercises: [{
    exerciseId: { type: mongoose.Schema.Types.ObjectId },
    actualSets: { type: Number },
    actualReps: [String],
    actualWeight: [Number],
    completed: { type: Boolean, default: false }
  }],
  duration: { type: Number }, // actual workout duration in minutes
  caloriesBurned: { type: Number },
  difficulty: { type: String, enum: ['too-easy', 'just-right', 'too-hard'] },
  notes: { type: String },
  completedAt: { type: Date, default: Date.now }
});

const Workout = mongoose.model('Workout', workoutSchema);
const WorkoutSession = mongoose.model('WorkoutSession', workoutSessionSchema);

module.exports = { Workout, WorkoutSession };
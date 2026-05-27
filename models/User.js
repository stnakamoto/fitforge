const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profile: {
    name: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active'],
      default: 'moderately-active'
    }
  },
  goals: {
    primary: {
      type: String,
      enum: ['build-muscle', 'lose-weight', 'maintain-weight', 'improve-endurance', 'improve-flexibility', 'general-health'],
      required: true
    },
    targetWeight: { type: Number },
    timeline: { type: String } // e.g., "3 months", "6 months"
  },
  preferences: {
    sports: [{
      type: String,
      enum: ['gym-training', 'calisthenics', 'athletics', 'cardio-sports', 'yoga-stretching', 'team-sports']
    }],
    workoutDuration: { type: Number, default: 45 }, // minutes
    workoutFrequency: { type: Number, default: 3 }, // times per week
    dietaryRestrictions: [String]
  },
  subscription: {
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    startDate: { type: Date },
    endDate: { type: Date },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String }
  },
  progress: {
    weightHistory: [{
      weight: Number,
      date: { type: Date, default: Date.now }
    }],
    workoutsCompleted: { type: Number, default: 0 },
    totalWorkoutTime: { type: Number, default: 0 }, // minutes
    streakDays: { type: Number, default: 0 },
    lastWorkoutDate: { type: Date }
  },
  dailyTracking: {
    waterIntake: { type: Number, default: 0 }, // glasses
    sleepHours: { type: Number, default: 8 },
    stepsCount: { type: Number, default: 0 },
    caloriesConsumed: { type: Number, default: 0 }
  },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if user has premium subscription
userSchema.methods.isPremium = function() {
  return this.subscription.plan === 'premium' && 
         this.subscription.endDate && 
         this.subscription.endDate > new Date();
};

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const nutritionTipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: {
    type: String,
    enum: ['weight-loss', 'muscle-building', 'general-health', 'hydration', 'meal-prep', 'supplements'],
    required: true
  },
  targetGoals: [{
    type: String,
    enum: ['build-muscle', 'lose-weight', 'maintain-weight', 'improve-endurance', 'improve-flexibility', 'general-health']
  }],
  isPremium: { type: Boolean, default: false },
  imageUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const mealPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  targetGoal: {
    type: String,
    enum: ['build-muscle', 'lose-weight', 'maintain-weight', 'improve-endurance', 'improve-flexibility', 'general-health'],
    required: true
  },
  caloriesPerDay: { type: Number, required: true },
  macros: {
    protein: { type: Number, required: true }, // grams
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true }
  },
  meals: [{
    name: { type: String, required: true }, // breakfast, lunch, dinner, snack
    foods: [{
      name: { type: String, required: true },
      quantity: { type: String, required: true },
      calories: { type: Number },
      protein: { type: Number },
      carbs: { type: Number },
      fats: { type: Number }
    }],
    totalCalories: { type: Number },
    prepTime: { type: Number } // minutes
  }],
  dietaryTags: [String], // vegetarian, vegan, gluten-free, etc.
  isPremium: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const foodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  meals: [{
    type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
    foods: [{
      name: { type: String, required: true },
      quantity: { type: String, required: true },
      calories: { type: Number, required: true }
    }],
    totalCalories: { type: Number, required: true }
  }],
  totalCalories: { type: Number, required: true },
  waterIntake: { type: Number, default: 0 }, // glasses
  notes: { type: String }
});

const NutritionTip = mongoose.model('NutritionTip', nutritionTipSchema);
const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
const FoodLog = mongoose.model('FoodLog', foodLogSchema);

module.exports = { NutritionTip, MealPlan, FoodLog };
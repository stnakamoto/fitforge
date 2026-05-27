const mongoose = require('mongoose');

const aiMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['motivation', 'workout-suggestion', 'nutrition-tip', 'progress-update', 'reminder', 'achievement'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isRead: { type: Boolean, default: false },
  actionRequired: { type: Boolean, default: false },
  relatedData: {
    workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout' },
    nutritionTipId: { type: mongoose.Schema.Types.ObjectId, ref: 'NutritionTip' },
    progressMetric: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  scheduledFor: { type: Date }
});

const coachingInsightSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['progress-analysis', 'goal-adjustment', 'habit-pattern', 'performance-trend'],
    required: true
  },
  insight: { type: String, required: true },
  recommendations: [String],
  dataPoints: [{
    metric: { type: String, required: true },
    value: { type: Number, required: true },
    date: { type: Date, required: true }
  }],
  confidence: { type: Number, min: 0, max: 1 }, // AI confidence in the insight
  createdAt: { type: Date, default: Date.now }
});

const userInteractionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  interactionType: {
    type: String,
    enum: ['workout-completed', 'goal-updated', 'weight-logged', 'feedback-given', 'question-asked'],
    required: true
  },
  data: { type: mongoose.Schema.Types.Mixed },
  response: { type: String },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
  createdAt: { type: Date, default: Date.now }
});

const AIMessage = mongoose.model('AIMessage', aiMessageSchema);
const CoachingInsight = mongoose.model('CoachingInsight', coachingInsightSchema);
const UserInteraction = mongoose.model('UserInteraction', userInteractionSchema);

module.exports = { AIMessage, CoachingInsight, UserInteraction };
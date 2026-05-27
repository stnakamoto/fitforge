import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Target, TrendingUp } from 'lucide-react';
import axios from 'axios';
import './Nutrition.css';

const Nutrition = () => {
  const [meals, setMeals] = useState([]);
  const [dailyStats, setDailyStats] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    calorieGoal: 2000,
    proteinGoal: 150,
    carbsGoal: 250,
    fatGoal: 67
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNutritionData();
  }, [selectedDate]);

  const fetchNutritionData = async () => {
    try {
      const [mealsResponse, statsResponse] = await Promise.all([
        axios.get(`/api/nutrition/meals?date=${selectedDate}`),
        axios.get(`/api/nutrition/stats?date=${selectedDate}`)
      ]);
      
      setMeals(mealsResponse.data);
      setDailyStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (current, goal) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'primary';
  };

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

  const getMealsByType = (type) => {
    return meals.filter(meal => meal.type === type);
  };

  const getMealTypeCalories = (type) => {
    return getMealsByType(type).reduce((total, meal) => total + meal.calories, 0);
  };

  if (loading) {
    return (
      <div className="nutrition-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading nutrition data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nutrition-container">
      <div className="nutrition-header">
        <div className="header-content">
          <h1>Nutrition Tracking</h1>
          <p>Monitor your daily nutrition and reach your goals</p>
        </div>
        <div className="header-actions">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-picker"
          />
          <button className="btn-primary">
            <Plus className="icon" />
            Add Food
          </button>
        </div>
      </div>

      <div className="nutrition-overview">
        <div className="calories-card">
          <div className="calories-content">
            <h2>Daily Calories</h2>
            <div className="calories-display">
              <span className="current-calories">{dailyStats.calories}</span>
              <span className="goal-calories">/ {dailyStats.calorieGoal}</span>
            </div>
            <div className="calories-remaining">
              {dailyStats.calorieGoal - dailyStats.calories > 0 
                ? `${dailyStats.calorieGoal - dailyStats.calories} remaining`
                : `${dailyStats.calories - dailyStats.calorieGoal} over goal`
              }
            </div>
          </div>
          <div className="calories-chart">
            <div 
              className="calories-progress"
              style={{ 
                background: `conic-gradient(#667eea 0deg ${getProgressPercentage(dailyStats.calories, dailyStats.calorieGoal) * 3.6}deg, #e1e5e9 ${getProgressPercentage(dailyStats.calories, dailyStats.calorieGoal) * 3.6}deg 360deg)`
              }}
            >
              <div className="progress-center">
                <Target className="target-icon" />
              </div>
            </div>
          </div>
        </div>

        <div className="macros-grid">
          <div className="macro-card">
            <h3>Protein</h3>
            <div className="macro-value">
              {dailyStats.protein}g / {dailyStats.proteinGoal}g
            </div>
            <div className="macro-progress">
              <div 
                className={`progress-bar ${getProgressColor(getProgressPercentage(dailyStats.protein, dailyStats.proteinGoal))}`}
                style={{ width: `${getProgressPercentage(dailyStats.protein, dailyStats.proteinGoal)}%` }}
              ></div>
            </div>
          </div>

          <div className="macro-card">
            <h3>Carbs</h3>
            <div className="macro-value">
              {dailyStats.carbs}g / {dailyStats.carbsGoal}g
            </div>
            <div className="macro-progress">
              <div 
                className={`progress-bar ${getProgressColor(getProgressPercentage(dailyStats.carbs, dailyStats.carbsGoal))}`}
                style={{ width: `${getProgressPercentage(dailyStats.carbs, dailyStats.carbsGoal)}%` }}
              ></div>
            </div>
          </div>

          <div className="macro-card">
            <h3>Fat</h3>
            <div className="macro-value">
              {dailyStats.fat}g / {dailyStats.fatGoal}g
            </div>
            <div className="macro-progress">
              <div 
                className={`progress-bar ${getProgressColor(getProgressPercentage(dailyStats.fat, dailyStats.fatGoal))}`}
                style={{ width: `${getProgressPercentage(dailyStats.fat, dailyStats.fatGoal)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="meals-section">
        {mealTypes.map(type => (
          <div key={type} className="meal-category">
            <div className="meal-header">
              <h3>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
              <div className="meal-calories">
                {getMealTypeCalories(type)} calories
              </div>
            </div>
            
            <div className="meal-items">
              {getMealsByType(type).length > 0 ? (
                getMealsByType(type).map(meal => (
                  <div key={meal._id} className="meal-item">
                    <div className="meal-info">
                      <h4>{meal.name}</h4>
                      <p>{meal.quantity} {meal.unit}</p>
                    </div>
                    <div className="meal-nutrition">
                      <span className="calories">{meal.calories} cal</span>
                      <div className="macros">
                        <span>P: {meal.protein}g</span>
                        <span>C: {meal.carbs}g</span>
                        <span>F: {meal.fat}g</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-meal">
                  <p>No {type} logged yet</p>
                  <button className="btn-outline">
                    <Plus className="icon" />
                    Add {type}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Nutrition;
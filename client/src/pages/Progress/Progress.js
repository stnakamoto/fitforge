import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Target, Award, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from 'axios';
import './Progress.css';

const Progress = () => {
  const [progressData, setProgressData] = useState({
    weightData: [],
    workoutStats: [],
    achievements: [],
    currentStats: {
      currentWeight: 0,
      startWeight: 0,
      goalWeight: 0,
      totalWorkouts: 0,
      totalCaloriesBurned: 0,
      currentStreak: 0
    }
  });
  const [timeRange, setTimeRange] = useState('3months');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, [timeRange]);

  const fetchProgressData = async () => {
    try {
      const response = await axios.get(`/api/users/progress?range=${timeRange}`);
      setProgressData(response.data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeightChange = () => {
    const { currentWeight, startWeight } = progressData.currentStats;
    const change = currentWeight - startWeight;
    return {
      value: Math.abs(change).toFixed(1),
      direction: change >= 0 ? 'gained' : 'lost',
      color: change >= 0 ? '#e74c3c' : '#27ae60'
    };
  };

  const getGoalProgress = () => {
    const { currentWeight, startWeight, goalWeight } = progressData.currentStats;
    if (goalWeight === startWeight) return 0;
    
    const totalChange = goalWeight - startWeight;
    const currentChange = currentWeight - startWeight;
    return Math.min((currentChange / totalChange) * 100, 100);
  };

  const timeRanges = [
    { value: '1month', label: '1 Month' },
    { value: '3months', label: '3 Months' },
    { value: '6months', label: '6 Months' },
    { value: '1year', label: '1 Year' }
  ];

  if (loading) {
    return (
      <div className="progress-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your progress...</p>
        </div>
      </div>
    );
  }

  const weightChange = getWeightChange();
  const goalProgress = getGoalProgress();

  return (
    <div className="progress-container">
      <div className="progress-header">
        <div className="header-content">
          <h1>Your Progress</h1>
          <p>Track your fitness journey and celebrate your achievements</p>
        </div>
        <div className="time-range-selector">
          {timeRanges.map(range => (
            <button
              key={range.value}
              className={`range-btn ${timeRange === range.value ? 'active' : ''}`}
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-card primary">
          <div className="stat-icon">
            <Target />
          </div>
          <div className="stat-content">
            <h3>{progressData.currentStats.currentWeight} kg</h3>
            <p>Current Weight</p>
            <div className="stat-change" style={{ color: weightChange.color }}>
              {weightChange.value} kg {weightChange.direction}
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <Activity />
          </div>
          <div className="stat-content">
            <h3>{progressData.currentStats.totalWorkouts}</h3>
            <p>Total Workouts</p>
            <div className="stat-change">
              This {timeRange}
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <Award />
          </div>
          <div className="stat-content">
            <h3>{progressData.currentStats.currentStreak}</h3>
            <p>Day Streak</p>
            <div className="stat-change">
              Keep it up!
            </div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <TrendingUp />
          </div>
          <div className="stat-content">
            <h3>{progressData.currentStats.totalCaloriesBurned}</h3>
            <p>Calories Burned</p>
            <div className="stat-change">
              Total burned
            </div>
          </div>
        </div>
      </div>

      <div className="progress-charts">
        <div className="chart-section">
          <div className="chart-header">
            <h2>Weight Progress</h2>
            <div className="goal-progress">
              <div className="progress-bar-container">
                <div 
                  className="progress-bar"
                  style={{ width: `${Math.max(0, goalProgress)}%` }}
                ></div>
              </div>
              <span>{goalProgress.toFixed(0)}% to goal</span>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData.weightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#667eea" 
                  strokeWidth={3}
                  dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-section">
          <div className="chart-header">
            <h2>Workout Activity</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData.workoutStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="workouts" fill="#667eea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="achievements-section">
        <h2>Recent Achievements</h2>
        {progressData.achievements.length > 0 ? (
          <div className="achievements-grid">
            {progressData.achievements.map((achievement, index) => (
              <div key={index} className="achievement-card">
                <div className="achievement-icon">
                  <Award />
                </div>
                <div className="achievement-content">
                  <h3>{achievement.title}</h3>
                  <p>{achievement.description}</p>
                  <span className="achievement-date">
                    {new Date(achievement.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-achievements">
            <Award className="empty-icon" />
            <p>No achievements yet. Keep working out to unlock them!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
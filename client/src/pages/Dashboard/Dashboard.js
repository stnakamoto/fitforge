import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Calendar, 
  Zap,
  Award,
  Clock,
  Users
} from 'lucide-react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    weeklyWorkouts: 0,
    currentStreak: 0,
    totalCaloriesBurned: 0
  });
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, workoutsResponse] = await Promise.all([
        axios.get('/api/users/stats'),
        axios.get('/api/workouts/recent')
      ]);
      
      setStats(statsResponse.data);
      setRecentWorkouts(workoutsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      title: 'Start Workout',
      description: 'Begin your training session',
      icon: <Zap className="icon" />,
      link: '/workouts',
      color: 'primary'
    },
    {
      title: 'Track Nutrition',
      description: 'Log your meals and calories',
      icon: <Target className="icon" />,
      link: '/nutrition',
      color: 'success'
    },
    {
      title: 'View Progress',
      description: 'Check your fitness journey',
      icon: <TrendingUp className="icon" />,
      link: '/progress',
      color: 'info'
    },
    {
      title: 'AI Coach',
      description: 'Get personalized guidance',
      icon: <Users className="icon" />,
      link: '/ai-coach',
      color: 'warning'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>{getGreeting()}, {user?.name?.split(' ')[0]}!</h1>
          <p>Ready to crush your fitness goals today?</p>
        </div>
        <div className="date-section">
          <Calendar className="calendar-icon" />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Activity />
          </div>
          <div className="stat-content">
            <h3>{stats.totalWorkouts}</h3>
            <p>Total Workouts</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">
            <Target />
          </div>
          <div className="stat-content">
            <h3>{stats.weeklyWorkouts}</h3>
            <p>This Week</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">
            <Award />
          </div>
          <div className="stat-content">
            <h3>{stats.currentStreak}</h3>
            <p>Day Streak</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon info">
            <Zap />
          </div>
          <div className="stat-content">
            <h3>{stats.totalCaloriesBurned}</h3>
            <p>Calories Burned</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link} className={`action-card ${action.color}`}>
                <div className="action-icon">
                  {action.icon}
                </div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="recent-activity">
          <h2>Recent Workouts</h2>
          {recentWorkouts.length > 0 ? (
            <div className="workout-list">
              {recentWorkouts.map((workout) => (
                <div key={workout._id} className="workout-item">
                  <div className="workout-info">
                    <h4>{workout.name}</h4>
                    <p>{workout.type} • {workout.duration} minutes</p>
                  </div>
                  <div className="workout-meta">
                    <Clock className="clock-icon" />
                    <span>{new Date(workout.completedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Activity className="empty-icon" />
              <p>No workouts yet. Start your first workout!</p>
              <Link to="/workouts" className="btn-primary">
                Browse Workouts
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
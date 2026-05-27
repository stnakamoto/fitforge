import React from 'react';
import { Users, Activity, Target, TrendingUp } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      icon: <Users className="stat-icon" />,
      color: 'primary'
    },
    {
      title: 'Active Workouts',
      value: '456',
      change: '+8%',
      icon: <Activity className="stat-icon" />,
      color: 'success'
    },
    {
      title: 'Completed Sessions',
      value: '2,890',
      change: '+15%',
      icon: <Target className="stat-icon" />,
      color: 'warning'
    },
    {
      title: 'Revenue',
      value: '$12,450',
      change: '+23%',
      icon: <TrendingUp className="stat-icon" />,
      color: 'info'
    }
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your FitForge platform</p>
      </div>

      <div className="admin-stats">
        {stats.map((stat, index) => (
          <div key={index} className={`admin-stat-card ${stat.color}`}>
            <div className="stat-icon-container">
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
              <span className="stat-change">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-content">
        <div className="admin-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-btn">Manage Users</button>
            <button className="action-btn">View Reports</button>
            <button className="action-btn">System Settings</button>
            <button className="action-btn">Content Management</button>
          </div>
        </div>

        <div className="admin-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-info">
                <h4>New user registration</h4>
                <p>John Doe joined the platform</p>
              </div>
              <span className="activity-time">2 hours ago</span>
            </div>
            <div className="activity-item">
              <div className="activity-info">
                <h4>Workout completed</h4>
                <p>Sarah completed "Full Body Strength"</p>
              </div>
              <span className="activity-time">3 hours ago</span>
            </div>
            <div className="activity-item">
              <div className="activity-info">
                <h4>Premium subscription</h4>
                <p>Mike upgraded to Premium plan</p>
              </div>
              <span className="activity-time">5 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { User, Settings, Target, Activity, Bell, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      age: user?.age || '',
      height: user?.height || '',
      weight: user?.weight || '',
      targetWeight: user?.targetWeight || '',
      primaryGoal: user?.primaryGoal || '',
      activityLevel: user?.activityLevel || '',
      experienceLevel: user?.experienceLevel || ''
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User /> },
    { id: 'goals', label: 'Goals', icon: <Target /> },
    { id: 'preferences', label: 'Preferences', icon: <Settings /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell /> },
    { id: 'security', label: 'Security', icon: <Lock /> }
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.put('/api/users/profile', data);
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="tab-content">
            <h2>Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <span className="error-message">{errors.name.message}</span>}
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <span className="error-message">{errors.email.message}</span>}
              </div>
              
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  {...register('age', { required: 'Age is required' })}
                />
                {errors.age && <span className="error-message">{errors.age.message}</span>}
              </div>
              
              <div className="form-group">
                <label>Gender</label>
                <select {...register('gender')}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="tab-content">
            <h2>Fitness Goals</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Current Weight (kg)</label>
                <input
                  type="number"
                  {...register('weight', { required: 'Weight is required' })}
                />
                {errors.weight && <span className="error-message">{errors.weight.message}</span>}
              </div>
              
              <div className="form-group">
                <label>Target Weight (kg)</label>
                <input
                  type="number"
                  {...register('targetWeight')}
                />
              </div>
              
              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  {...register('height', { required: 'Height is required' })}
                />
                {errors.height && <span className="error-message">{errors.height.message}</span>}
              </div>
              
              <div className="form-group">
                <label>Primary Goal</label>
                <select {...register('primaryGoal')}>
                  <option value="">Select your primary goal</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="strength">Build Strength</option>
                  <option value="endurance">Improve Endurance</option>
                  <option value="general_fitness">General Fitness</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Activity Level</label>
                <select {...register('activityLevel')}>
                  <option value="">Select activity level</option>
                  <option value="sedentary">Sedentary</option>
                  <option value="lightly_active">Lightly Active</option>
                  <option value="moderately_active">Moderately Active</option>
                  <option value="very_active">Very Active</option>
                  <option value="extremely_active">Extremely Active</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Experience Level</label>
                <select {...register('experienceLevel')}>
                  <option value="">Select experience level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="tab-content">
            <h2>Workout Preferences</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Preferred Workout Duration</label>
                <select {...register('preferredWorkoutDuration')}>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90+ minutes</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Workout Frequency (per week)</label>
                <select {...register('workoutFrequency')}>
                  <option value="2">2 days</option>
                  <option value="3">3 days</option>
                  <option value="4">4 days</option>
                  <option value="5">5 days</option>
                  <option value="6">6 days</option>
                  <option value="7">7 days</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Available Equipment</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" {...register('equipment')} value="bodyweight" />
                  Bodyweight Only
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" {...register('equipment')} value="dumbbells" />
                  Dumbbells
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" {...register('equipment')} value="barbell" />
                  Barbell
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" {...register('equipment')} value="gym" />
                  Full Gym Access
                </label>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="tab-content">
            <h2>Notification Settings</h2>
            <div className="notification-settings">
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Workout Reminders</h3>
                  <p>Get notified when it's time for your scheduled workouts</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Progress Updates</h3>
                  <p>Weekly summaries of your fitness progress</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h3>AI Coach Tips</h3>
                  <p>Personalized tips and motivation from your AI coach</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Achievement Notifications</h3>
                  <p>Celebrate when you reach new milestones</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="tab-content">
            <h2>Security Settings</h2>
            <div className="security-section">
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" placeholder="Enter current password" />
              </div>
              
              <div className="form-group">
                <label>New Password</label>
                <input type="password" placeholder="Enter new password" />
              </div>
              
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" placeholder="Confirm new password" />
              </div>
              
              <button className="btn-secondary">
                Update Password
              </button>
            </div>
            
            <div className="danger-zone">
              <h3>Danger Zone</h3>
              <p>Once you delete your account, there is no going back. Please be certain.</p>
              <button className="btn-danger">
                Delete Account
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="user-info">
            <div className="user-avatar">
              <User className="avatar-icon" />
            </div>
            <div className="user-details">
              <h3>{user?.name}</h3>
              <p>{user?.email}</p>
            </div>
          </div>
          
          <nav className="profile-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="profile-main">
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderTabContent()}
            
            {activeTab !== 'notifications' && activeTab !== 'security' && (
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '/api';

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fitforge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fitforge_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('fitforge_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('fitforge_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login with:', { email, baseURL: axios.defaults.baseURL });
      const response = await axios.post('/auth/login', { email, password });
      console.log('✅ Login response:', response.data);
      
      const { token, user } = response.data;
      
      localStorage.setItem('fitforge_token', token);
      setUser(user);
      
      toast.success('Welcome back to FitForge!');
      return { success: true, user };
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration with:', userData);
      const response = await axios.post('/auth/register', userData);
      console.log('✅ Registration response:', response.data);
      
      const { token, user } = response.data;
      
      localStorage.setItem('fitforge_token', token);
      setUser(user);
      
      toast.success('Welcome to FitForge!');
      return { success: true, user };
    } catch (error) {
      console.error('❌ Registration error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('fitforge_token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  const completeOnboarding = async (onboardingData) => {
    try {
      const response = await axios.post('/users/onboarding', onboardingData);
      setUser(prevUser => ({
        ...prevUser,
        ...response.data.user,
        onboardingComplete: true
      }));
      
      toast.success('Profile setup completed!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Onboarding failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/users/profile', profileData);
      setUser(prevUser => ({
        ...prevUser,
        ...response.data.user
      }));
      
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logWeight = async (weight) => {
    try {
      const response = await axios.post('/users/weight', { weight });
      setUser(prevUser => ({
        ...prevUser,
        profile: { ...prevUser.profile, weight },
        progress: {
          ...prevUser.progress,
          weightHistory: response.data.weightHistory
        }
      }));
      
      toast.success('Weight logged successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to log weight';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateDailyTracking = async (trackingData) => {
    try {
      const response = await axios.post('/users/daily-tracking', trackingData);
      setUser(prevUser => ({
        ...prevUser,
        dailyTracking: response.data.dailyTracking
      }));
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update tracking';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post('/auth/refresh');
      const { token } = response.data;
      localStorage.setItem('fitforge_token', token);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    completeOnboarding,
    updateProfile,
    logWeight,
    updateDailyTracking,
    refreshToken,
    fetchUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Components
import Navbar from './components/Layout/Navbar';
import LoadingSpinner from './components/UI/LoadingSpinner';
import PWAUtils from './components/PWAUtils';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Onboarding from './pages/Auth/Onboarding';
import Dashboard from './pages/Dashboard/Dashboard';
import Workouts from './pages/Workouts/Workouts';
import WorkoutDetail from './pages/Workouts/WorkoutDetail';
import WorkoutSession from './pages/Workouts/WorkoutSession';
import Nutrition from './pages/Nutrition/Nutrition';
import Progress from './pages/Progress/Progress';
import AICoach from './pages/AICoach/AICoach';
import Subscription from './pages/Subscription/Subscription';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Profile from './pages/Profile/Profile';

import './App.css';

// Initialize Stripe
const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY && 
                     process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY !== 'pk_test_placeholder_key_for_development'
                     ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
                     : Promise.resolve(null);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user || !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Onboarding Route Component
const OnboardingRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.onboardingComplete) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Elements stripe={stripePromise}>
        <AuthProvider>
          <Router>
            <div className="App app-container">
              <PWAUtils />
              <AppContent />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </Elements>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {user && <Navbar />}
      <main className={user ? 'main-content' : ''}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
          
          {/* Onboarding Route */}
          <Route path="/onboarding" element={
            <OnboardingRoute>
              <Onboarding />
            </OnboardingRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/workouts" element={
            <ProtectedRoute>
              <Workouts />
            </ProtectedRoute>
          } />
          
          <Route path="/workouts/:id" element={
            <ProtectedRoute>
              <WorkoutDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/workout-session/:sessionId" element={
            <ProtectedRoute>
              <WorkoutSession />
            </ProtectedRoute>
          } />
          
          <Route path="/nutrition" element={
            <ProtectedRoute>
              <Nutrition />
            </ProtectedRoute>
          } />
          
          <Route path="/progress" element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          } />
          
          <Route path="/ai-coach" element={
            <ProtectedRoute>
              <AICoach />
            </ProtectedRoute>
          } />
          
          <Route path="/subscription" element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
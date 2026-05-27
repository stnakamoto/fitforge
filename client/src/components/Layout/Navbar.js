import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Dumbbell, 
  Apple, 
  TrendingUp, 
  Bot, 
  Crown, 
  User, 
  Settings,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/workouts', icon: Dumbbell, label: 'Workouts' },
    { path: '/nutrition', icon: Apple, label: 'Nutrition' },
    { path: '/progress', icon: TrendingUp, label: 'Progress' },
    { path: '/ai-coach', icon: Bot, label: 'AI Coach' },
  ];

  if (user?.isAdmin) {
    navItems.push({ path: '/admin', icon: Shield, label: 'Admin' });
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <nav className={`navbar ${isMobileMenuOpen ? 'navbar-open' : ''}`}>
        <div className="navbar-header">
          <Link to="/dashboard" className="navbar-brand" onClick={closeMobileMenu}>
            <div className="logo-container">
              <img src="/logo.png" alt="FitForge" className="navbar-logo" />
              <span className="brand-text">FitForge</span>
            </div>
          </Link>
        </div>

        <div className="navbar-content">
          {/* Navigation Links */}
          <ul className="navbar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                             (item.path === '/admin' && location.pathname.startsWith('/admin'));
              
              return (
                <li key={item.path} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Subscription Status */}
          <div className="subscription-status">
            {user?.subscription?.plan === 'premium' ? (
              <div className="premium-status">
                <Crown size={16} />
                <span>Premium</span>
              </div>
            ) : (
              <Link 
                to="/subscription" 
                className="upgrade-link"
                onClick={closeMobileMenu}
              >
                <Crown size={16} />
                <span>Upgrade to Premium</span>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar">
                {user?.profile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <div className="user-name">{user?.profile?.name || 'User'}</div>
                <div className="user-email">{user?.email}</div>
              </div>
            </div>

            <div className="user-actions">
              <Link 
                to="/profile" 
                className="user-action"
                onClick={closeMobileMenu}
              >
                <User size={16} />
                <span>Profile</span>
              </Link>
              
              <Link 
                to="/subscription" 
                className="user-action"
                onClick={closeMobileMenu}
              >
                <Settings size={16} />
                <span>Subscription</span>
              </Link>
              
              <button 
                onClick={handleLogout}
                className="user-action logout-btn"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu}></div>
      )}
    </>
  );
};

export default Navbar;
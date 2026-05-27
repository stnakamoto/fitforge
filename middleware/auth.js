const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    
    // Optional: Get user data for premium checks
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(403).json({ message: 'Admin access denied' });
  }
};

const premiumAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (!req.user.isPremium()) {
      return res.status(403).json({ message: 'Premium subscription required' });
    }
    
    next();
  } catch (error) {
    console.error('Premium auth error:', error);
    res.status(403).json({ message: 'Premium access denied' });
  }
};

module.exports = { auth, adminAuth, premiumAuth };
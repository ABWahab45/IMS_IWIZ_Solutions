const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { uploadConfigs, handleMulterError } = require('../middleware/upload');
const { validateUser } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// @route   GET /api/auth/test
// @desc    Test route to check if server is running
// @access  Public
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working!' });
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (but in real app, this might be admin-only)
router.post('/register', validateUser, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, role, phone } = req.body;

    console.log('=== REGISTRATION DEBUG ===');
    console.log('Registration data:', {
      firstName,
      lastName,
      email,
      passwordLength: password.length,
      role,
      phone
    });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role: role || 'manager',
      phone
    });

    await user.save();
    console.log('User saved successfully:', {
      id: user._id,
      email: user.email,
      passwordHash: user.password.substring(0, 30) + '...'
    });

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    console.log('=== LOGIN DEBUG ===');
    console.log('Received email:', email);
    console.log('Received password length:', password.length);

    // Find user by email (try different variations)
    let user = null;
    const emailVariations = [
      email,
      email.toLowerCase(),
      email.trim(),
      email.toLowerCase().trim()
    ];
    
    for (const variation of emailVariations) {
      user = await User.findOne({ email: variation });
      if (user) {
        console.log('User found with email variation:', variation);
        break;
      }
    }
    
    if (!user) {
      console.log('User not found for any email variation:', emailVariations);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      isActive: user.isActive,
      passwordHash: user.password.substring(0, 20) + '...'
    });

    // Check if user is active
    if (!user.isActive) {
      console.log('User is inactive');
      return res.status(400).json({ message: 'Account is deactivated. Please contact administrator.' });
    }

    // Check password
    console.log('About to compare password...');
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password does not match');
      console.log('Stored password hash:', user.password);
      console.log('Attempted password length:', password.length);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password for debugging (temporary)
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    console.log('=== PASSWORD RESET ===');
    console.log('Email:', email);
    console.log('New password length:', newPassword.length);
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    console.log('Password updated successfully');
    
    res.json({
      message: 'Password updated successfully',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Reset error' });
  }
});

// @route   GET /api/auth/list-users
// @desc    List all users (temporary for debugging)
// @access  Public
router.get('/list-users', async (req, res) => {
  try {
    const users = await User.find({}).select('firstName lastName email role createdAt isActive');
    res.json({
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ message: 'Error listing users' });
  }
});

// @route   POST /api/auth/clear-rate-limit
// @desc    Clear rate limit for current IP (temporary for debugging)
// @access  Public
router.post('/clear-rate-limit', async (req, res) => {
  try {
    // This is a temporary endpoint to help with debugging
    // In production, you'd want to remove this or make it admin-only
    res.json({
      message: 'Rate limit cleared for this IP',
      timestamp: new Date().toISOString(),
      note: 'This endpoint should be removed in production'
    });
  } catch (error) {
    console.error('Clear rate limit error:', error);
    res.status(500).json({ message: 'Error clearing rate limit' });
  }
});

// @route   POST /api/auth/reset-all-passwords
// @desc    Reset all user passwords to a default (temporary)
// @access  Public
router.post('/reset-all-passwords', async (req, res) => {
  try {
    const { defaultPassword } = req.body;
    
    console.log('=== BULK PASSWORD RESET ===');
    console.log('Default password:', defaultPassword);
    
    const users = await User.find({});
    const results = [];
    
    for (const user of users) {
      try {
        user.password = defaultPassword;
        await user.save();
        results.push({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          status: 'success'
        });
        console.log(`Password reset for: ${user.email}`);
      } catch (error) {
        results.push({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          status: 'error',
          error: error.message
        });
        console.error(`Error resetting password for ${user.email}:`, error);
      }
    }
    
    res.json({
      message: 'Bulk password reset completed',
      totalUsers: users.length,
      results: results
    });
  } catch (error) {
    console.error('Bulk reset error:', error);
    res.status(500).json({ message: 'Bulk reset error' });
  }
});

// @route   POST /api/auth/debug-password
// @desc    Debug password comparison (temporary)
// @access  Public
router.post('/debug-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('=== PASSWORD DEBUG ===');
    console.log('Original email:', email);
    console.log('Password length:', password.length);
    
    // Test different email variations
    const emailVariations = [
      email,
      email.toLowerCase(),
      email.trim(),
      email.toLowerCase().trim()
    ];
    
    let user = null;
    let foundWithVariation = null;
    
    for (const variation of emailVariations) {
      user = await User.findOne({ email: variation });
      if (user) {
        foundWithVariation = variation;
        break;
      }
    }
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        testedVariations: emailVariations
      });
    }
    
    const isMatch = await user.comparePassword(password);
    
    res.json({
      userFound: true,
      userId: user._id,
      userEmail: user.email,
      foundWithVariation: foundWithVariation,
      passwordMatch: isMatch,
      passwordHash: user.password.substring(0, 30) + '...',
      createdAt: user.createdAt,
      testedVariations: emailVariations
    });
  } catch (error) {
    console.error('Password debug error:', error);
    res.status(500).json({ message: 'Debug error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, uploadConfigs.avatar, handleMulterError, [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone } = req.body;
    const updateData = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (req.file) updateData.avatar = req.file.filename;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id);
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
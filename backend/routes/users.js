const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { auth, checkPermission, checkRole } = require('../middleware/auth');
const { uploadConfigs, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users with filtering and pagination
// @access  Private (Admin only)
router.get('/', auth, checkPermission('canManageUsers'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['firstName', 'lastName', 'email', 'role', 'createdAt', 'lastLogin']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 10,
      search,
      role,
      department,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/for-handover
// @desc    Get users for handover purposes (simplified)
// @access  Private (any authenticated user with product management permissions)
router.get('/for-handover', auth, checkPermission('canManageProducts'), async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('firstName lastName role')
      .sort({ firstName: 1, lastName: 1 });

    res.json({ users });
  } catch (error) {
    console.error('Get users for handover error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private (Admin only)
router.get('/:id', auth, checkRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin only)
router.post('/', auth, checkRole('admin'), uploadConfigs.avatar, handleMulterError, [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
      body('role').isIn(['admin', 'manager', 'employee']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Process uploaded avatar
    let avatarUrl = '';
    if (req.file) {
      avatarUrl = req.file.filename; // Store just the filename
    }

    // Create new user
    const userData = {
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      avatar: avatarUrl
    };

    const user = new User(userData);
    await user.save();

    // Return user without password
    const userResponse = await User.findById(user._id).select('-password');

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error during user creation' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin only)
router.put('/:id', auth, checkRole('admin'), uploadConfigs.avatar, handleMulterError, [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('role').optional().isIn(['admin', 'manager', 'employee']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
    }

    // Process new avatar if uploaded
    const updateData = { ...req.body };
    if (req.file) {
      updateData.avatar = req.file.filename; // Store just the filename
    }

    // Don't allow users to update their own admin status
    if (req.params.id === req.user.id && req.body.role && req.body.role !== user.role) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', auth, checkRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/toggle-status
// @desc    Toggle user active status
// @access  Private (Admin only)
router.put('/:id/toggle-status', auth, checkRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/reset-password
// @desc    Reset user password
// @access  Private (Admin only)
router.put('/:id/reset-password', auth, checkRole('admin'), [
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    user.password = req.body.newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/permissions
// @desc    Update user permissions
// @access  Private (Admin only)
router.put('/:id/permissions', auth, checkRole('admin'), [
  body('permissions').isObject().withMessage('Permissions must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update permissions
    user.permissions = { ...user.permissions, ...req.body.permissions };
    await user.save();

    res.json({
      message: 'User permissions updated successfully',
      permissions: user.permissions
    });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get users overview statistics
// @access  Private (Admin only)
router.get('/stats/overview', auth, checkRole('admin'), async (req, res) => {
  try {
    const [totalUsers, activeUsers, inactiveUsers, usersByRole, usersByDepartment] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      User.aggregate([
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    // Get recently joined users
    const recentUsers = await User.find()
      .select('firstName lastName email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      overview: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers
      },
      usersByRole,
      usersByDepartment,
      recentUsers
    });
  } catch (error) {
    console.error('Get users stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/roles
// @desc    Get available roles and departments
// @access  Private
router.get('/roles', auth, checkPermission('canManageUsers'), async (req, res) => {
  try {
    const roles = [
      { value: 'admin', label: 'Administrator', description: 'Full system access' },
      { value: 'manager', label: 'Manager', description: 'Management level access' },
      { value: 'employee', label: 'Employee', description: 'Standard employee access' },
      { value: 'viewer', label: 'Viewer', description: 'Read-only access' }
    ];

    const departments = [
      { value: 'inventory', label: 'Inventory Management' },
      { value: 'sales', label: 'Sales' },
      { value: 'purchasing', label: 'Purchasing' },
      { value: 'warehouse', label: 'Warehouse' },
      { value: 'management', label: 'Management' }
    ];

    res.json({ roles, departments });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
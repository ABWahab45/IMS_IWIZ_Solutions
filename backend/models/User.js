const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee'], // admin, manager, and employee
    default: 'manager',
    required: true
  },

  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  permissions: {
    canViewProducts: { type: Boolean, default: true },
    canAddProducts: { type: Boolean, default: true },
    canEditProducts: { type: Boolean, default: true },
    canDeleteProducts: { type: Boolean, default: false },
    canManageProducts: { type: Boolean, default: true }, // Both roles can manage
    canViewOrders: { type: Boolean, default: true },
    canManageOrders: { type: Boolean, default: true },
    canManageUsers: { type: Boolean, default: false }, // Only admin can manage users
    canRequestHandover: { type: Boolean, default: false }, // Employee can request handover
    canReturnHandover: { type: Boolean, default: false }, // Employee can return handover
  }
}, {
  timestamps: true
});

// Simple indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    console.log('=== PASSWORD HASHING ===');
    console.log('Original password length:', this.password.length);
    console.log('Password being hashed:', this.password);
    
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    console.log('Password hashed successfully');
    console.log('Hashed password:', this.password.substring(0, 30) + '...');
    
    next();
  } catch (error) {
    console.error('Password hashing error:', error);
    next(error);
  }
});

// Set permissions based on role
userSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'admin':
        this.permissions = {
          canViewProducts: true,
          canAddProducts: true,
          canEditProducts: true,
          canDeleteProducts: true,
          canManageProducts: true, // Admin can do handovers
          canViewOrders: true,
          canManageOrders: true,
          canManageUsers: true, // Only admin can manage users
          canRequestHandover: true,
          canReturnHandover: true,
        };
        break;
      case 'manager':
        this.permissions = {
          canViewProducts: true,
          canAddProducts: true,
          canEditProducts: true,
          canDeleteProducts: true, // Manager can delete products
          canManageProducts: true, // Manager can do handovers
          canViewOrders: true,
          canManageOrders: true,
          canManageUsers: false, // Manager cannot manage users
          canRequestHandover: false,
          canReturnHandover: false,
        };
        break;
      case 'employee':
        this.permissions = {
          canViewProducts: true,
          canAddProducts: false,
          canEditProducts: false,
          canDeleteProducts: false,
          canManageProducts: false, // Employee cannot manage products
          canViewOrders: true,
          canManageOrders: false,
          canManageUsers: false, // Employee cannot manage users
          canRequestHandover: true, // Employee can request handover
          canReturnHandover: true, // Employee can return handover
        };
        break;
    }
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('=== PASSWORD COMPARISON ===');
  console.log('Candidate password:', candidatePassword);
  console.log('Candidate password length:', candidatePassword.length);
  console.log('Stored hash:', this.password.substring(0, 30) + '...');
  
  const result = await bcrypt.compare(candidatePassword, this.password);
  console.log('Comparison result:', result);
  
  return result;
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
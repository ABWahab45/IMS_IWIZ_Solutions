const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'env.config') });

async function checkFailsafeAdmin() {
  try {
    console.log('=== FAILSAFE ADMIN CHECK ===\n');
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Check if failsafe admin exists
    const failsafeAdmin = await User.findOne({ email: 'irtazamadadnaqvi@iwiz.com' });
    
    if (failsafeAdmin) {
      console.log('✅ FAILSAFE ADMIN EXISTS');
      console.log('Email:', failsafeAdmin.email);
      console.log('Name:', failsafeAdmin.firstName, failsafeAdmin.lastName);
      console.log('Role:', failsafeAdmin.role);
      console.log('Is Active:', failsafeAdmin.isActive);
      console.log('Created:', failsafeAdmin.createdAt);
      console.log('Last Login:', failsafeAdmin.lastLogin || 'Never');
      
      console.log('\n📋 PERMISSIONS:');
      console.log('canViewProducts:', failsafeAdmin.permissions.canViewProducts);
      console.log('canAddProducts:', failsafeAdmin.permissions.canAddProducts);
      console.log('canEditProducts:', failsafeAdmin.permissions.canEditProducts);
      console.log('canDeleteProducts:', failsafeAdmin.permissions.canDeleteProducts);
      console.log('canManageProducts:', failsafeAdmin.permissions.canManageProducts);
      console.log('canViewOrders:', failsafeAdmin.permissions.canViewOrders);
      console.log('canManageOrders:', failsafeAdmin.permissions.canManageOrders);
      console.log('canManageUsers:', failsafeAdmin.permissions.canManageUsers);
      
      console.log('\n🔐 PASSWORD STATUS:');
      console.log('Password is set:', !!failsafeAdmin.password);
      console.log('Expected password: 03145372506');
      
    } else {
      console.log('❌ FAILSAFE ADMIN DOES NOT EXIST');
      console.log('You need to create the failsafe admin account.');
      console.log('Run: node scripts/create-failsafe-admin.js');
    }

    // Check total admin users
    const adminUsers = await User.find({ role: 'admin' });
    console.log('\n📊 ADMIN USERS SUMMARY:');
    console.log('Total admin users:', adminUsers.length);
    adminUsers.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email} (${admin.firstName} ${admin.lastName})`);
    });

  } catch (error) {
    console.error('❌ Error checking failsafe admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
checkFailsafeAdmin();

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iwiz_inventory';

async function testLogin() {
  try {
    console.log('🔍 Testing Login System...');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Test 1: Check if failsafe admin exists
    console.log('\n📋 Test 1: Checking failsafe admin...');
    const failsafeAdmin = await User.findOne({ email: 'irtazamadadnaqvi@iwiz.com' });
    
    if (failsafeAdmin) {
      console.log('✅ Failsafe admin found');
      console.log('   Email:', failsafeAdmin.email);
      console.log('   Role:', failsafeAdmin.role);
      console.log('   Active:', failsafeAdmin.isActive);
      console.log('   Created:', failsafeAdmin.createdAt);
    } else {
      console.log('❌ Failsafe admin not found');
    }

    // Test 2: Check total users
    console.log('\n📋 Test 2: Checking total users...');
    const totalUsers = await User.countDocuments();
    console.log('   Total users in database:', totalUsers);

    // Test 3: List all users
    console.log('\n📋 Test 3: Listing all users...');
    const allUsers = await User.find({}).select('email role isActive createdAt');
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role}) - Active: ${user.isActive}`);
    });

    // Test 4: Test password comparison
    if (failsafeAdmin) {
      console.log('\n📋 Test 4: Testing password comparison...');
      const testPassword = '03145372506';
      const isMatch = failsafeAdmin.comparePassword(testPassword);
      console.log('   Password match:', isMatch ? '✅' : '❌');
    }

    console.log('\n🎯 Login Test Summary:');
    if (failsafeAdmin && failsafeAdmin.isActive) {
      console.log('✅ Login should work with:');
      console.log('   Email: irtazamadadnaqvi@iwiz.com');
      console.log('   Password: 03145372506');
    } else {
      console.log('❌ Login will fail - check failsafe admin setup');
    }

  } catch (error) {
    console.error('❌ Error during login test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testLogin();

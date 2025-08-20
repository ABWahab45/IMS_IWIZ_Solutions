const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iwiz_inventory';

async function checkAndFixUserPermissions() {
  try {
    console.log('🔍 Checking User Permissions...');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Get all users
    const users = await User.find({});
    console.log(`\n📋 Found ${users.length} users in database`);

    let fixedCount = 0;
    let issuesFound = 0;

    for (const user of users) {
      console.log(`\n👤 Checking user: ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      
      let needsUpdate = false;
      const currentPermissions = { ...user.permissions };

      // Check if permissions match the role
      const expectedPermissions = {
        canViewProducts: true,
        canAddProducts: user.role === 'admin' || user.role === 'manager',
        canEditProducts: user.role === 'admin' || user.role === 'manager',
        canDeleteProducts: user.role === 'admin',
        canManageProducts: user.role === 'admin' || user.role === 'manager',
        canViewOrders: true,
        canManageOrders: user.role === 'admin' || user.role === 'manager',
        canManageUsers: user.role === 'admin',
        canRequestHandover: user.role === 'employee',
        canReturnHandover: user.role === 'employee',
      };

      // Check each permission
      for (const [permission, expectedValue] of Object.entries(expectedPermissions)) {
        if (user.permissions[permission] !== expectedValue) {
          console.log(`   ❌ ${permission}: ${user.permissions[permission]} (should be ${expectedValue})`);
          issuesFound++;
          needsUpdate = true;
        } else {
          console.log(`   ✅ ${permission}: ${user.permissions[permission]}`);
        }
      }

      // Fix permissions if needed
      if (needsUpdate) {
        console.log(`   🔧 Fixing permissions for ${user.email}...`);
        
        // Don't update failsafe admin
        if (user.email === 'irtazamadadnaqvi@iwiz.com') {
          console.log(`   ⚠️  Skipping failsafe admin - keeping existing permissions`);
          continue;
        }

        user.permissions = expectedPermissions;
        await user.save();
        fixedCount++;
        console.log(`   ✅ Permissions fixed for ${user.email}`);
      } else {
        console.log(`   ✅ Permissions are correct`);
      }
    }

    console.log('\n🎯 Summary:');
    console.log(`   Total users checked: ${users.length}`);
    console.log(`   Issues found: ${issuesFound}`);
    console.log(`   Users fixed: ${fixedCount}`);

    if (fixedCount > 0) {
      console.log('\n✅ User permissions have been corrected!');
      console.log('   Employees can no longer create, edit, or delete products.');
    } else {
      console.log('\n✅ All user permissions are correct!');
    }

  } catch (error) {
    console.error('❌ Error checking user permissions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkAndFixUserPermissions();

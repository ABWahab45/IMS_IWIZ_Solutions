const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iwiz_inventory';

async function syncUserPermissions() {
  try {
    console.log('🔄 Syncing User Permissions...');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Get all users
    const users = await User.find({});
    console.log(`\n📋 Found ${users.length} users in database`);

    let updatedCount = 0;
    let issuesFound = 0;

    for (const user of users) {
      console.log(`\n👤 Checking user: ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   Current role: ${user.role}`);
      
      // Define correct permissions for the user's role
      const correctPermissions = {
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

      // Check if permissions match the role
      let needsUpdate = false;
      for (const [permission, expectedValue] of Object.entries(correctPermissions)) {
        if (user.permissions[permission] !== expectedValue) {
          console.log(`   ❌ ${permission}: ${user.permissions[permission]} (should be ${expectedValue})`);
          needsUpdate = true;
          issuesFound++;
        }
      }

      // Update permissions if needed
      if (needsUpdate) {
        console.log(`   🔧 Updating permissions for ${user.email}...`);
        
        // Don't update failsafe admin
        if (user.email === 'irtazamadadnaqvi@iwiz.com') {
          console.log(`   ⚠️  Skipping failsafe admin - keeping existing permissions`);
          continue;
        }

        user.permissions = correctPermissions;
        await user.save();
        updatedCount++;
        console.log(`   ✅ Permissions updated for ${user.email}`);
      } else {
        console.log(`   ✅ Permissions are correct`);
      }
    }

    console.log('\n🎯 Sync Summary:');
    console.log(`   Total users checked: ${users.length}`);
    console.log(`   Issues found: ${issuesFound}`);
    console.log(`   Users updated: ${updatedCount}`);

    if (updatedCount > 0) {
      console.log('\n✅ User permissions have been synchronized!');
      console.log('   All users now have permissions that match their roles.');
    } else {
      console.log('\n✅ All user permissions are already correct!');
    }

  } catch (error) {
    console.error('❌ Error syncing user permissions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the sync
syncUserPermissions();

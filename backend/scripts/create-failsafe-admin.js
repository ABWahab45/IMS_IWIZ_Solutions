const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iwiz_inventory';

async function createFailsafeAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Check if failsafe admin already exists
    const existingAdmin = await User.findOne({ email: 'irtazamadadnaqvi@iwiz.com' });
    
    if (existingAdmin) {
      console.log('Failsafe admin already exists, updating password...');
      existingAdmin.password = '03145372506';
      await existingAdmin.save();
      console.log('✅ Failsafe admin password updated');
    } else {
      // Create new failsafe admin
      const failsafeAdmin = new User({
        firstName: 'Failsafe',
        lastName: 'Admin',
        email: 'irtazamadadnaqvi@iwiz.com',
        password: '03145372506',
        role: 'admin',
        isActive: true,
        permissions: {
          canViewProducts: true,
          canAddProducts: true,
          canEditProducts: true,
          canDeleteProducts: true,
          canManageProducts: true,
          canViewOrders: true,
          canManageOrders: true,
          canManageUsers: true,
          canRequestHandover: false,
          canReturnHandover: false,
        }
      });

      await failsafeAdmin.save();
      console.log('✅ Failsafe admin account created successfully');
    }

    console.log('\n🔐 Failsafe Admin Credentials:');
    console.log('Email: irtazamadadnaqvi@iwiz.com');
    console.log('Password: 03145372506');
    console.log('\n⚠️  Keep these credentials safe! This is your emergency access account.');

  } catch (error) {
    console.error('Error creating failsafe admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createFailsafeAdmin();

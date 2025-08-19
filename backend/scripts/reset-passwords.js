const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iwiz_inventory';

async function resetAllPasswords() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    // Reset all passwords to "testing"
    for (const user of users) {
      user.password = 'testing';
      await user.save();
      console.log(`Reset password for user: ${user.email} (${user.firstName} ${user.lastName})`);
    }

    console.log('\n✅ All passwords have been reset to "testing"');
    console.log('You can now login with any user using password: testing');

  } catch (error) {
    console.error('Error resetting passwords:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
resetAllPasswords();

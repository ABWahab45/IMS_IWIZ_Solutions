const mongoose = require('mongoose');
const User = require('../models/User');

console.log('=== CREATING FAILSAFE ADMIN (PRODUCTION) ===\n');

async function createFailsafeAdminProduction() {
  try {
    console.log('Connecting to production MongoDB...');
    
    // Use production MongoDB URI from environment
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable not set');
      console.log('Please set the MONGODB_URI environment variable');
      return;
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to production MongoDB successfully\n');

    // Check if failsafe admin already exists
    const existingAdmin = await User.findOne({ email: 'irtazamadadnaqvi@iwiz.com' });
    
    if (existingAdmin) {
      console.log('✅ FAILSAFE ADMIN ALREADY EXISTS');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.firstName, existingAdmin.lastName);
      console.log('Role:', existingAdmin.role);
      console.log('Is Active:', existingAdmin.isActive);
      console.log('Created:', existingAdmin.createdAt);
      
      // Update password to ensure it's correct
      existingAdmin.password = '03145372506';
      await existingAdmin.save();
      console.log('✅ Password updated to: 03145372506');
      
    } else {
      console.log('Creating new failsafe admin account...');
      
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
      console.log('✅ FAILSAFE ADMIN CREATED SUCCESSFULLY');
    }

    console.log('\n🔐 FAILSAFE ADMIN CREDENTIALS:');
    console.log('Email: irtazamadadnaqvi@iwiz.com');
    console.log('Password: 03145372506');
    console.log('\n⚠️  IMPORTANT:');
    console.log('- Keep these credentials safe!');
    console.log('- This is your emergency access account');
    console.log('- Use only when other admin accounts are unavailable');
    console.log('- This account cannot be deleted or modified');

  } catch (error) {
    console.error('❌ Error creating failsafe admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
createFailsafeAdminProduction();

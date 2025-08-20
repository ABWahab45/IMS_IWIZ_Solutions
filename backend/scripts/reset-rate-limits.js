const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iwiz_inventory';

async function resetRateLimits() {
  try {
    console.log('🔧 Resetting Rate Limits...');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Note: Rate limits are typically stored in memory or Redis
    // This is just a placeholder for the concept
    console.log('\n📋 Rate Limit Information:');
    console.log('   - Login attempts: 20 per 15 minutes');
    console.log('   - Registration attempts: 3 per hour');
    console.log('   - Failsafe admin bypasses rate limits');
    
    console.log('\n🎯 To reset rate limits:');
    console.log('   1. Wait 15 minutes for automatic reset');
    console.log('   2. Or restart the server');
    console.log('   3. Or use failsafe admin: irtazamadadnaqvi@iwiz.com');

    console.log('\n✅ Rate limit information displayed');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
resetRateLimits();

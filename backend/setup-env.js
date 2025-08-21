const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Environment Variables for MongoDB Atlas...\n');

// Read the env.config file
const envConfigPath = path.join(__dirname, 'env.config');
let envContent = '';

if (fs.existsSync(envConfigPath)) {
  envContent = fs.readFileSync(envConfigPath, 'utf8');
  console.log('✅ Found env.config file');
} else {
  console.log('❌ env.config file not found');
  process.exit(1);
}

// Create .env file
const envPath = path.join(__dirname, '.env');

// Update NODE_ENV to development for local testing
envContent = envContent.replace('NODE_ENV=production', 'NODE_ENV=development');

// Write to .env file
fs.writeFileSync(envPath, envContent);
console.log('✅ Created .env file');

console.log('\n📋 Current Configuration:');
console.log('NODE_ENV: development');
console.log('PORT: 5000');
console.log('MongoDB URI: Set (from env.config)');
console.log('Cloudinary: Configured');

console.log('\n🔍 To verify your MongoDB Atlas connection:');
console.log('1. Make sure your MongoDB Atlas cluster is running');
console.log('2. Check that your database user has the correct permissions');
console.log('3. Verify your IP address is whitelisted in Network Access');
console.log('4. Test the connection with: npm run test:connection');

console.log('\n📖 Next steps:');
console.log('1. Test connection: npm run test:connection');
console.log('2. Start development server: npm run dev');
console.log('3. For production: npm run setup:production');

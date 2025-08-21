const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing MongoDB Password Encoding...\n');

// Your password with @ symbol
const password = 'Qwerty1122@';

// URL encode the password to handle special characters
const encodedPassword = encodeURIComponent(password);

console.log('📋 Password Details:');
console.log('Original password:', password);
console.log('Encoded password:', encodedPassword);

// Create the connection string with encoded password
const connectionString = `mongodb+srv://AbdulWahab:${encodedPassword}@cluster0.8apfguz.mongodb.net/iwiz_inventory?retryWrites=true&w=majority&appName=Cluster0`;

console.log('\n📋 Updated connection string:');
console.log(connectionString.replace(/\/\/.*@/, '//***:***@'));

// Read the current .env file
const envPath = path.join(__dirname, '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('\n✅ Found .env file');
} else {
  console.log('\n❌ .env file not found, creating one...');
  envContent = `# MongoDB Atlas Connection String
MONGODB_URI=${connectionString}

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=5a70d35684296d99997ae2e7fb1cf9bd77ee8e1f4890c4c4c8da021a6291c1c5b210f165b7086b39fe4e8d58bc86af4470c156097d0b6c4213cb01021b1d5b27
JWT_EXPIRE=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=10485760

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dermm8zsk
CLOUDINARY_API_KEY=967688844686185
CLOUDINARY_API_SECRET=PuLX6WNIXYLIc8eSSyF-fSqYy6E`;
}

// Update the MongoDB URI
const lines = envContent.split('\n');
const updatedLines = lines.map(line => {
  if (line.startsWith('MONGODB_URI=')) {
    return `MONGODB_URI=${connectionString}`;
  }
  return line;
});

// Write back to .env file
fs.writeFileSync(envPath, updatedLines.join('\n'));

console.log('✅ Updated .env file with properly encoded password');
console.log('\n🔍 Testing MongoDB connection...');

// Test the connection
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000
})
.then(() => {
  console.log('✅ MongoDB connection successful!');
  console.log('\n🎉 Your system is now ready!');
  console.log('\n📖 Next steps:');
  console.log('1. Start backend: npm run dev');
  console.log('2. Start frontend: cd ../frontend && npm start');
  console.log('3. Access your app at: http://localhost:3000');
  mongoose.disconnect();
})
.catch(err => {
  console.log('❌ MongoDB connection failed:', err.message);
  console.log('\n🔧 If still failing, check:');
  console.log('1. MongoDB Atlas cluster is running');
  console.log('2. Network Access allows your IP');
  console.log('3. User "AbdulWahab" exists in Database Access');
});

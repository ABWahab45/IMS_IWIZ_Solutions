const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'env.config') });

console.log('=== SERVER STARTUP TEST ===\n');

// Test 1: Check environment variables
console.log('1. ENVIRONMENT VARIABLES:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not Set');
console.log('PORT:', process.env.PORT || 'Not Set (will use 5000)');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
console.log('JWT_EXPIRE:', process.env.JWT_EXPIRE || 'Not Set');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not Set');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set');
console.log('');

// Test 2: Check required modules
console.log('2. REQUIRED MODULES:');
const requiredModules = [
  'express',
  'mongoose',
  'cors',
  'dotenv',
  'jsonwebtoken',
  'bcryptjs',
  'express-validator',
  'express-rate-limit',
  'multer',
  'cloudinary',
  'multer-storage-cloudinary'
];

requiredModules.forEach(moduleName => {
  try {
    require(moduleName);
    console.log(`✅ ${moduleName}: OK`);
  } catch (error) {
    console.log(`❌ ${moduleName}: FAILED - ${error.message}`);
  }
});
console.log('');

// Test 3: Check local files
console.log('3. LOCAL FILES:');
const localFiles = [
  '../server.js',
  '../routes/auth.js',
  '../routes/products.js',
  '../routes/users.js',
  '../middleware/auth.js',
  '../middleware/upload.js',
  '../models/User.js',
  '../models/Product.js'
];

localFiles.forEach(filePath => {
  try {
    require(filePath);
    console.log(`✅ ${filePath}: OK`);
  } catch (error) {
    console.log(`❌ ${filePath}: FAILED - ${error.message}`);
  }
});
console.log('');

// Test 4: Check if server can be imported
console.log('4. SERVER IMPORT TEST:');
try {
  const server = require('../server.js');
  console.log('✅ Server module can be imported');
} catch (error) {
  console.log('❌ Server module import failed:', error.message);
}

console.log('\n=== END TEST ===');

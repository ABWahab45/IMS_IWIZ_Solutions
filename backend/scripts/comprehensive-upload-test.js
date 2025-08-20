const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'env.config') });

console.log('=== COMPREHENSIVE UPLOAD TEST ===\n');

// Test 1: Check middleware imports
console.log('1. CHECKING MIDDLEWARE IMPORTS:');
try {
  const { uploadConfigs, handleMulterError } = require('../middleware/upload');
  console.log('✅ Middleware imported successfully');
  console.log('uploadConfigs keys:', Object.keys(uploadConfigs));
  console.log('handleMulterError type:', typeof handleMulterError);
} catch (error) {
  console.error('❌ Middleware import failed:', error.message);
}

// Test 2: Check route imports
console.log('\n2. CHECKING ROUTE IMPORTS:');
try {
  const authRoutes = require('../routes/auth');
  console.log('✅ Auth routes imported successfully');
  console.log('Auth routes type:', typeof authRoutes);
} catch (error) {
  console.error('❌ Auth routes import failed:', error.message);
}

try {
  const productRoutes = require('../routes/products');
  console.log('✅ Product routes imported successfully');
  console.log('Product routes type:', typeof productRoutes);
} catch (error) {
  console.error('❌ Product routes import failed:', error.message);
}

// Test 3: Check Cloudinary configuration
console.log('\n3. CHECKING CLOUDINARY CONFIG:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not Set');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set');

// Test 4: Check upload configurations
console.log('\n4. CHECKING UPLOAD CONFIGURATIONS:');
try {
  const { uploadConfigs } = require('../middleware/upload');
  
  console.log('Avatar upload:');
  console.log('  - Type:', typeof uploadConfigs.avatar);
  console.log('  - Is function:', typeof uploadConfigs.avatar === 'function');
  console.log('  - Expected field: avatar');
  
  console.log('Product upload:');
  console.log('  - Type:', typeof uploadConfigs.productImages);
  console.log('  - Is function:', typeof uploadConfigs.productImages === 'function');
  console.log('  - Expected field: productImages');
  
} catch (error) {
  console.error('❌ Upload config check failed:', error.message);
}

// Test 5: Check route handlers
console.log('\n5. CHECKING ROUTE HANDLERS:');
try {
  const authRoutes = require('../routes/auth');
  const productRoutes = require('../routes/products');
  
  // Check if routes have the expected middleware
  console.log('Auth routes stack length:', authRoutes.stack ? authRoutes.stack.length : 'No stack');
  console.log('Product routes stack length:', productRoutes.stack ? productRoutes.stack.length : 'No stack');
  
} catch (error) {
  console.error('❌ Route handler check failed:', error.message);
}

// Test 6: Check for any syntax errors
console.log('\n6. CHECKING FOR SYNTAX ERRORS:');
try {
  require('../routes/auth');
  console.log('✅ Auth routes syntax OK');
} catch (error) {
  console.error('❌ Auth routes syntax error:', error.message);
}

try {
  require('../routes/products');
  console.log('✅ Product routes syntax OK');
} catch (error) {
  console.error('❌ Product routes syntax error:', error.message);
}

try {
  require('../middleware/upload');
  console.log('✅ Upload middleware syntax OK');
} catch (error) {
  console.error('❌ Upload middleware syntax error:', error.message);
}

console.log('\n=== END COMPREHENSIVE TEST ===');

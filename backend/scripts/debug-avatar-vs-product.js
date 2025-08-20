const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'env.config') });

const { uploadConfigs } = require('../middleware/upload');

console.log('=== AVATAR vs PRODUCT UPLOAD DEBUG ===\n');

// Check avatar upload configuration
console.log('1. AVATAR UPLOAD CONFIG:');
console.log('uploadConfigs.avatar:', uploadConfigs.avatar);
console.log('Type:', typeof uploadConfigs.avatar);
console.log('Is function:', typeof uploadConfigs.avatar === 'function');
console.log('Field name expected: avatar');
console.log('Storage type: CloudinaryStorage');
console.log('Folder: iwiz-inventory/avatars');
console.log('');

// Check product upload configuration
console.log('2. PRODUCT UPLOAD CONFIG:');
console.log('uploadConfigs.productImages:', uploadConfigs.productImages);
console.log('Type:', typeof uploadConfigs.productImages);
console.log('Is function:', typeof uploadConfigs.productImages === 'function');
console.log('Field name expected: productImages');
console.log('Storage type: CloudinaryStorage');
console.log('Folder: iwiz-inventory/products');
console.log('');

// Check if both are properly configured
console.log('3. COMPARISON:');
console.log('Avatar upload is function:', typeof uploadConfigs.avatar === 'function');
console.log('Product upload is function:', typeof uploadConfigs.productImages === 'function');
console.log('Both configured:', uploadConfigs.avatar && uploadConfigs.productImages);
console.log('');

// Check multer configuration details
console.log('4. MULTER DETAILS:');
if (uploadConfigs.avatar) {
  console.log('Avatar - Storage:', uploadConfigs.avatar.storage ? 'Configured' : 'Not configured');
  console.log('Avatar - FileFilter:', uploadConfigs.avatar.fileFilter ? 'Configured' : 'Not configured');
  console.log('Avatar - Limits:', uploadConfigs.avatar.limits ? 'Configured' : 'Not configured');
}

if (uploadConfigs.productImages) {
  console.log('Product - Storage:', uploadConfigs.productImages.storage ? 'Configured' : 'Not configured');
  console.log('Product - FileFilter:', uploadConfigs.productImages.fileFilter ? 'Configured' : 'Not configured');
  console.log('Product - Limits:', uploadConfigs.productImages.limits ? 'Configured' : 'Not configured');
}

console.log('\n=== END DEBUG ===');

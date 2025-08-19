const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'env.config') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const checkCloudinaryContent = async () => {
  try {
    console.log('=== CHECKING CLOUDINARY CONTENT ===\n');
    
    // Check avatars folder
    console.log('Checking avatars folder...');
    const avatarsResult = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'iwiz-inventory/avatars/',
      max_results: 50
    });
    
    console.log(`Found ${avatarsResult.resources.length} avatars:`);
    avatarsResult.resources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.public_id} - ${resource.secure_url}`);
    });
    
    console.log('\n---\n');
    
    // Check products folder
    console.log('Checking products folder...');
    const productsResult = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'iwiz-inventory/products/',
      max_results: 50
    });
    
    console.log(`Found ${productsResult.resources.length} product images:`);
    productsResult.resources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.public_id} - ${resource.secure_url}`);
    });
    
    console.log('\n---\n');
    
    // Check root folder for any orphaned files
    console.log('Checking root folder for any files...');
    const rootResult = await cloudinary.api.resources({
      type: 'upload',
      max_results: 20
    });
    
    console.log(`Found ${rootResult.resources.length} total files in account:`);
    rootResult.resources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.public_id} - ${resource.secure_url}`);
    });
    
  } catch (error) {
    console.error('Error checking Cloudinary content:', error);
  }
};

checkCloudinaryContent();

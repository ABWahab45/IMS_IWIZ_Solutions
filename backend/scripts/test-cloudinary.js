const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'env.config') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const testCloudinary = async () => {
  try {
    console.log('Testing Cloudinary configuration...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set');
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.log('\n❌ Cloudinary credentials are not properly configured!');
      console.log('Please follow the setup guide in CLOUDINARY_SETUP.md');
      return;
    }

    // Test the connection by getting account info
    const result = await cloudinary.api.ping();
    console.log('\n✅ Cloudinary connection successful!');
    console.log('Response:', result);
    
  } catch (error) {
    console.log('\n❌ Cloudinary connection failed!');
    console.log('Error:', error.message);
    console.log('\nPlease check your Cloudinary credentials and follow the setup guide.');
  }
};

testCloudinary();

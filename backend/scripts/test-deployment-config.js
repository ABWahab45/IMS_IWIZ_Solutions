const cloudinary = require('cloudinary').v2;

console.log('=== DEPLOYMENT CONFIGURATION TEST ===');
console.log('');

// Test environment variables
console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not Set');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || '❌ Not Set');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Not Set');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not Set');
console.log('');

// Test Cloudinary configuration
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  console.log('Testing Cloudinary connection...');
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  cloudinary.api.ping()
    .then(result => {
      console.log('✅ Cloudinary connection successful!');
      console.log('Response:', result);
    })
    .catch(error => {
      console.log('❌ Cloudinary connection failed!');
      console.log('Error:', error.message);
    });
} else {
  console.log('❌ Cloudinary credentials not found in environment variables');
  console.log('Please check your Render environment variables');
}

console.log('');
console.log('=== END OF TEST ===');

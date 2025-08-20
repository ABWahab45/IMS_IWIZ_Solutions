const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', 'env.config') });

const { uploadConfigs, handleMulterError } = require('../middleware/upload');

console.log('=== TESTING AVATAR UPLOAD ===\n');

// Create a mock request and response
const mockReq = {
  file: null,
  files: null,
  body: {
    firstName: 'Test',
    lastName: 'User',
    phone: '1234567890'
  }
};

const mockRes = {
  status: (code) => {
    console.log('Response status:', code);
    return mockRes;
  },
  json: (data) => {
    console.log('Response data:', JSON.stringify(data, null, 2));
    return mockRes;
  }
};

const mockNext = (error) => {
  if (error) {
    console.log('Next error:', error);
  } else {
    console.log('Next called successfully');
  }
};

// Test the avatar upload middleware
console.log('1. Testing avatar upload middleware...');
try {
  // This should be a function that expects (req, res, next)
  console.log('uploadConfigs.avatar type:', typeof uploadConfigs.avatar);
  console.log('uploadConfigs.avatar:', uploadConfigs.avatar);
  
  // Test if it's callable
  if (typeof uploadConfigs.avatar === 'function') {
    console.log('Avatar upload middleware is callable');
    
    // Try to call it with mock data
    uploadConfigs.avatar(mockReq, mockRes, mockNext);
    
    console.log('Mock request after middleware:');
    console.log('- file:', mockReq.file);
    console.log('- files:', mockReq.files);
    console.log('- body:', mockReq.body);
  } else {
    console.log('Avatar upload middleware is NOT callable');
  }
} catch (error) {
  console.error('Error testing avatar upload:', error);
}

console.log('\n2. Testing product upload middleware...');
try {
  console.log('uploadConfigs.productImages type:', typeof uploadConfigs.productImages);
  
  if (typeof uploadConfigs.productImages === 'function') {
    console.log('Product upload middleware is callable');
    
    // Try to call it with mock data
    uploadConfigs.productImages(mockReq, mockRes, mockNext);
    
    console.log('Mock request after middleware:');
    console.log('- file:', mockReq.file);
    console.log('- files:', mockReq.files);
    console.log('- body:', mockReq.body);
  } else {
    console.log('Product upload middleware is NOT callable');
  }
} catch (error) {
  console.error('Error testing product upload:', error);
}

console.log('\n=== END TEST ===');

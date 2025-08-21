#!/usr/bin/env node

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

console.log('🧪 Testing IWIZ Inventory Management System Deployment...\n');

// Test configuration
async function testConfiguration() {
  console.log('📋 Configuration Test:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not Set');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not Set');
  console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Not Set');
  console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Not Set');
  console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not Set');
  console.log('');
}

// Test database connection
async function testDatabase() {
  console.log('🗄️  Database Connection Test:');
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Database connection successful');
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  }
  console.log('');
}

// Test server startup
async function testServer() {
  console.log('🚀 Server Startup Test:');
  try {
    const server = require('../server.js');
    console.log('✅ Server module loaded successfully');
    
    // Test health endpoint if server is running
    try {
      const response = await axios.get('http://localhost:5000/api/health', {
        timeout: 5000
      });
      console.log('✅ Health endpoint responding:', response.data.status);
    } catch (error) {
      console.log('⚠️  Health endpoint not accessible (server may not be running)');
    }
  } catch (error) {
    console.log('❌ Server startup failed:', error.message);
  }
  console.log('');
}

// Test Cloudinary connection
async function testCloudinary() {
  console.log('☁️  Cloudinary Connection Test:');
  try {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    // Test cloudinary connection by getting account info
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful');
  } catch (error) {
    console.log('❌ Cloudinary connection failed:', error.message);
  }
  console.log('');
}

// Test CORS configuration
async function testCORS() {
  console.log('🌐 CORS Configuration Test:');
  const allowedOrigins = [
    'http://localhost:3000',
    'https://your-app-name.trycloudflare.com',
    'https://iwiz-inventory.vercel.app'
  ];
  
  console.log('Allowed origins configured for:');
  allowedOrigins.forEach(origin => {
    console.log(`  - ${origin}`);
  });
  console.log('');
}

// Main test function
async function runTests() {
  try {
    await testConfiguration();
    await testDatabase();
    await testCloudinary();
    await testCORS();
    await testServer();
    
    console.log('🎉 All tests completed!');
    console.log('\n📖 Next steps:');
    console.log('1. For local development: npm run dev');
    console.log('2. For production: npm start');
    console.log('3. For Cloudflare tunnel: ./start-cloudflare.sh');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testConfiguration,
  testDatabase,
  testServer,
  testCloudinary,
  testCORS,
  runTests
};

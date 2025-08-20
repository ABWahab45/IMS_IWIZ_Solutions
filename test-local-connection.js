// Test script to verify local backend connection
const axios = require('axios');

const testLocalBackend = async () => {
  try {
    console.log('Testing local backend connection...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✓ Backend health check passed:', healthResponse.data);
    
    // Test CORS endpoint
    const corsResponse = await axios.get('http://localhost:5000/api/cors-test');
    console.log('✓ CORS test passed:', corsResponse.data);
    
    console.log('\n🎉 Local backend is running successfully!');
    console.log('Your Vercel frontend can now connect to: http://localhost:5000/api');
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    console.log('\nMake sure to:');
    console.log('1. Run "switch-to-local.bat" first');
    console.log('2. Start the backend: cd backend && npm start');
    console.log('3. Check if port 5000 is available');
  }
};

testLocalBackend();

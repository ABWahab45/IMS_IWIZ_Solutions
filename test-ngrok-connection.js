// Test script to verify ngrok connection
const axios = require('axios');

const testNgrokConnection = async () => {
  try {
    console.log('🔍 Testing ngrok connection...');
    
    // Get ngrok URL from command line argument or use default
    const ngrokUrl = process.argv[2] || 'https://abc123def456.ngrok.io';
    
    console.log(`Testing connection to: ${ngrokUrl}`);
    
    // Test health endpoint
    const healthResponse = await axios.get(`${ngrokUrl}/api/health`);
    console.log('✅ Backend health check passed:', healthResponse.data);
    
    // Test CORS endpoint
    const corsResponse = await axios.get(`${ngrokUrl}/api/cors-test`);
    console.log('✅ CORS test passed:', corsResponse.data);
    
    console.log('\n🎉 ngrok tunnel is working!');
    console.log(`Your Vercel frontend can now connect to: ${ngrokUrl}/api`);
    console.log('\n📋 Next steps:');
    console.log('1. Update Vercel environment variables with this URL');
    console.log('2. Redeploy your Vercel app');
    console.log('3. Test from your Vercel deployment');
    
  } catch (error) {
    console.error('❌ ngrok connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure ngrok is running: ngrok http 8080');
    console.log('2. Make sure your backend is running on port 8080');
    console.log('3. Check if the ngrok URL is correct');
    console.log('4. Try the command: node test-ngrok-connection.js YOUR_NGROK_URL');
  }
};

testNgrokConnection();

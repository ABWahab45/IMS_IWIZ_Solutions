// Script to get ngrok URL and test connection
const axios = require('axios');

const getNgrokUrl = async () => {
  try {
    console.log('🔍 Getting ngrok tunnel URL...');
    
    // Get ngrok API info
    const response = await axios.get('http://localhost:4040/api/tunnels');
    const tunnels = response.data.tunnels;
    
    if (tunnels.length === 0) {
      console.log('❌ No ngrok tunnels found. Make sure ngrok is running: ngrok http 8080');
      return;
    }
    
    // Get the HTTPS tunnel URL
    const httpsTunnel = tunnels.find(tunnel => tunnel.proto === 'https');
    
    if (!httpsTunnel) {
      console.log('❌ No HTTPS tunnel found');
      return;
    }
    
    const ngrokUrl = httpsTunnel.public_url;
    console.log(`✅ ngrok URL found: ${ngrokUrl}`);
    
    // Test the connection
    console.log('\n🧪 Testing connection...');
    const healthResponse = await axios.get(`${ngrokUrl}/api/health`);
    console.log('✅ Backend health check passed:', healthResponse.data);
    
    console.log('\n🎉 Everything is working!');
    console.log(`\n📋 Copy these environment variables to Vercel:`);
    console.log(`REACT_APP_API_URL=${ngrokUrl}/api`);
    console.log(`REACT_APP_BACKEND_URL=${ngrokUrl}`);
    
    console.log('\n🔗 Your Vercel frontend can now connect to your local backend!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Make sure:');
    console.log('1. ngrok is running: ngrok http 8080');
    console.log('2. Your backend is running on port 8080');
    console.log('3. You can access http://localhost:4040');
  }
};

getNgrokUrl();

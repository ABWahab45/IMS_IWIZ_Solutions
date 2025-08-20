// Test script to verify Vercel environment variables and connections
const axios = require('axios');

const testConnections = async () => {
  console.log('🔍 Testing all possible connections...\n');

  const urls = [
    {
      name: 'ngrok Backend (New)',
      url: 'https://233352d2f43f.ngrok-free.app'
    },
    {
      name: 'ngrok Backend (Old)',
      url: 'https://feebc6837dee.ngrok-free.app'
    },
    {
      name: 'Render Backend',
      url: 'https://ims-iwiz-solutions.onrender.com'
    },
    {
      name: 'Local Backend',
      url: 'http://localhost:8080'
    }
  ];

  for (const { name, url } of urls) {
    try {
      console.log(`🧪 Testing ${name}...`);
      const response = await axios.get(`${url}/api/health`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log(`✅ ${name} - SUCCESS`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Data: ${JSON.stringify(response.data, null, 2)}`);
      
    } catch (error) {
      console.log(`❌ ${name} - FAILED`);
      console.log(`   Error: ${error.message}`);
      
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${error.response.data.substring(0, 100)}...`);
      }
    }
    console.log('');
  }

  console.log('📋 Recommended Vercel Environment Variables:');
  console.log('For ngrok testing:');
  console.log('REACT_APP_API_URL=https://233352d2f43f.ngrok-free.app/api');
  console.log('REACT_APP_BACKEND_URL=https://233352d2f43f.ngrok-free.app');
  console.log('');
  console.log('For production:');
  console.log('REACT_APP_API_URL=https://ims-iwiz-solutions.onrender.com/api');
  console.log('REACT_APP_BACKEND_URL=https://ims-iwiz-solutions.onrender.com');
};

testConnections();

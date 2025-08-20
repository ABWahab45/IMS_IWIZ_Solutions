// Comprehensive test script for complete setup
const axios = require('axios');

const SERVER_IP = '192.168.1.10';
const SERVER_PORT = 3000;
const BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}`;

const testEndpoints = async () => {
  console.log('🧪 Testing Complete Setup...\n');
  console.log(`🌐 Server: ${BASE_URL}`);
  console.log('========================================\n');

  const endpoints = [
    {
      name: 'Health Check',
      url: `${BASE_URL}/api/health`,
      method: 'GET'
    },
    {
      name: 'Test Endpoint',
      url: `${BASE_URL}/api/test`,
      method: 'GET'
    },
    {
      name: 'CORS Test',
      url: `${BASE_URL}/api/cors-test`,
      method: 'GET'
    },
    {
      name: 'Products Endpoint',
      url: `${BASE_URL}/api/products`,
      method: 'GET'
    },
    {
      name: 'Login Endpoint',
      url: `${BASE_URL}/api/auth/login`,
      method: 'POST',
      data: { email: 'test@example.com', password: 'test123' }
    }
  ];

  let allTestsPassed = true;

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint.name}`);
      
      const config = {
        method: endpoint.method,
        url: endpoint.url,
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (endpoint.data) {
        config.data = endpoint.data;
      }

      const response = await axios(config);
      
      console.log(`✅ ${endpoint.name} - SUCCESS`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2).substring(0, 100)}...`);
      
    } catch (error) {
      console.log(`❌ ${endpoint.name} - FAILED`);
      console.log(`   Error: ${error.message}`);
      allTestsPassed = false;
    }
    console.log('');
  }

  console.log('========================================');
  
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('\n📋 Vercel Environment Variables:');
    console.log(`REACT_APP_API_URL=${BASE_URL}/api`);
    console.log(`REACT_APP_BACKEND_URL=${BASE_URL}`);
    console.log('\n🚀 Your setup is ready for:');
    console.log('1. ✅ Local testing');
    console.log('2. ✅ Vercel deployment');
    console.log('3. ✅ Server deployment');
    console.log('\n📁 Copy deployment/backend/ to their server PC');
  } else {
    console.log('❌ Some tests failed. Check server configuration.');
  }

  console.log('\n========================================');
};

testEndpoints();

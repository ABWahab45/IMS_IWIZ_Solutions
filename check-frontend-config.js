// Check frontend configuration
console.log('🔍 Checking Frontend Configuration...\n');

// Simulate the getBaseURL function logic
const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) {
    console.log('✅ Using REACT_APP_API_URL from environment');
    return process.env.REACT_APP_API_URL;
  }
  
  console.log('❌ REACT_APP_API_URL not found in environment');
  
  // Simulate window.location.hostname check
  const hostname = 'localhost'; // Change this to test different scenarios
  
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    console.log('🌐 Using production URL (Render)');
    const productionUrl = 'https://ims-iwiz-solutions.onrender.com/api';
    return productionUrl;
  }
  
  console.log('🏠 Using localhost URL');
  const localUrl = 'http://localhost:5000/api';
  return localUrl;
};

console.log('Current environment variables:');
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL || 'NOT SET');
console.log('REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL || 'NOT SET');

console.log('\n📋 Expected URLs:');
console.log('For your PC testing: http://192.168.1.10:3000/api');
console.log('For Render: https://ims-iwiz-solutions.onrender.com/api');
console.log('For localhost: http://localhost:5000/api');

console.log('\n🔧 To fix login issues:');
console.log('1. Set Vercel environment variables:');
console.log('   REACT_APP_API_URL=http://192.168.1.10:3000/api');
console.log('   REACT_APP_BACKEND_URL=http://192.168.1.10:3000');
console.log('2. Redeploy Vercel app');
console.log('3. Test login again');

const baseURL = getBaseURL();
console.log('\n🎯 Current baseURL:', baseURL);

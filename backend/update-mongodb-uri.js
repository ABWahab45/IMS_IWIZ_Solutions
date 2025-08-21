const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('🔧 MongoDB Atlas Connection String Updater\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📋 Instructions:');
console.log('1. Go to MongoDB Atlas Dashboard');
console.log('2. Click "Connect" on your cluster');
console.log('3. Choose "Connect your application"');
console.log('4. Copy the connection string');
console.log('5. Replace <password> with your actual password');
console.log('6. Replace <dbname> with "iwiz_inventory"\n');

rl.question('Paste your MongoDB Atlas connection string here: ', (connectionString) => {
  rl.close();
  
  if (!connectionString || connectionString.trim() === '') {
    console.log('❌ No connection string provided');
    return;
  }
  
  // Clean up the connection string
  let cleanConnectionString = connectionString.trim();
  
  // Replace <dbname> with iwiz_inventory if not already set
  if (cleanConnectionString.includes('<dbname>')) {
    cleanConnectionString = cleanConnectionString.replace('<dbname>', 'iwiz_inventory');
  }
  
  // Read the current .env file
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Update the MongoDB URI
  const lines = envContent.split('\n');
  const updatedLines = lines.map(line => {
    if (line.startsWith('MONGODB_URI=')) {
      return `MONGODB_URI=${cleanConnectionString}`;
    }
    return line;
  });
  
  // Write back to .env file
  fs.writeFileSync(envPath, updatedLines.join('\n'));
  
  console.log('✅ Updated MongoDB connection string');
  console.log('\n🔍 Testing connection...');
  
  // Test the connection
  require('dotenv').config();
  const mongoose = require('mongoose');
  
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
  })
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    console.log('\n🎉 Your system is now ready!');
    console.log('Next steps:');
    console.log('1. Start backend: npm run dev');
    console.log('2. Start frontend: cd ../frontend && npm start');
    mongoose.disconnect();
  })
  .catch(err => {
    console.log('❌ MongoDB connection failed:', err.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your username and password');
    console.log('2. Verify your IP is whitelisted in Network Access');
    console.log('3. Make sure your cluster is running');
    console.log('4. Check that your database user has proper permissions');
  });
});

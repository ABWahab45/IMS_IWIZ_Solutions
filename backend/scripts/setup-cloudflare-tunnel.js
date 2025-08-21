#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Cloudflare Tunnel Backend Setup');
console.log('=====================================\n');

// Your Cloudflare tunnel URL
const CLOUDFLARE_TUNNEL_URL = 'https://chosen-annotation-hearings-improvement.trycloudflare.com';

async function setupCloudflareTunnel() {
  try {
    console.log('📋 Your Cloudflare tunnel URL:', CLOUDFLARE_TUNNEL_URL);
    console.log('');

    // Create .env file for Cloudflare tunnel
    const envContent = `# Cloudflare Tunnel Environment Variables
# Your Cloudflare tunnel URL: ${CLOUDFLARE_TUNNEL_URL}

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://AbdulWahab:Qwerty1122%40@cluster0.8apfguz.mongodb.net/iwiz_inventory?retryWrites=true&w=majority&appName=Cluster0

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=5a70d35684296d99997ae2e7fb1cf9bd77ee8e1f4890c4c4c8da021a6291c1c5b210f165b7086b39fe4e8d58bc86af4470c156097d0b6c4213cb01021b1d5b27
JWT_EXPIRE=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=10485760

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dermm8zsk
CLOUDINARY_API_KEY=967688844686185
CLOUDINARY_API_SECRET=PuLX6WNIXYLIc8eSSyF-fSqYy6E

# Cloudflare Tunnel URL
CLOUDFLARE_TUNNEL_URL=${CLOUDFLARE_TUNNEL_URL}
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Created .env file for Cloudflare tunnel');

    // Create PM2 ecosystem file
    const pm2Config = `module.exports = {
  apps: [{
    name: 'iwiz-inventory-backend',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};`;

    fs.writeFileSync('ecosystem.config.js', pm2Config);
    console.log('✅ Created PM2 ecosystem.config.js');

    // Create logs directory
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
      console.log('✅ Created logs directory');
    }

    // Create startup script
    const startupScript = `@echo off
echo Starting Iwiz Inventory Backend with Cloudflare Tunnel...
echo Cloudflare URL: ${CLOUDFLARE_TUNNEL_URL}
echo.

cd /d "%~dp0"
set NODE_ENV=production
set PORT=5000

echo Installing dependencies...
npm install

echo Starting server...
npm start

pause`;

    fs.writeFileSync('start-cloudflare.bat', startupScript);
    console.log('✅ Created start-cloudflare.bat');

    // Create Cloudflare config template
    const cloudflareConfig = `# Cloudflare Tunnel Configuration
# Save this as config.yml in your Cloudflare tunnel directory

tunnel: your-tunnel-name
credentials-file: /path/to/your/credentials.json

ingress:
  - hostname: chosen-annotation-hearings-improvement.trycloudflare.com
    service: http://localhost:5000
  - service: http_status:404

# Optional: Add more hostnames if needed
# - hostname: your-custom-domain.com
#   service: http://localhost:5000
`;

    fs.writeFileSync('cloudflare-config.yml', cloudflareConfig);
    console.log('✅ Created cloudflare-config.yml template');

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Install dependencies: npm install');
    console.log('2. Start the server: npm start');
    console.log('3. Or use PM2: pm2 start ecosystem.config.js');
    console.log('4. Test your backend: https://chosen-annotation-hearings-improvement.trycloudflare.com/api/health');
    console.log('\n🔗 Your backend will be available at:');
    console.log(`   API: ${CLOUDFLARE_TUNNEL_URL}/api`);
    console.log(`   Health: ${CLOUDFLARE_TUNNEL_URL}/api/health`);

  } catch (error) {
    console.error('❌ Error during setup:', error.message);
  } finally {
    rl.close();
  }
}

setupCloudflareTunnel();

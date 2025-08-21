#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Server PC Setup for Cloudflare Tunnel\n');

// Function to check if command exists
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Function to check Node.js installation
function checkNodeJS() {
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js: ${nodeVersion}`);
    console.log(`✅ npm: ${npmVersion}`);
    return true;
  } catch (error) {
    console.log('❌ Node.js not found. Please install Node.js first.');
    console.log('📥 Download from: https://nodejs.org/');
    return false;
  }
}

// Function to check Cloudflared installation
function checkCloudflared() {
  try {
    const version = execSync('cloudflared --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Cloudflared: ${version}`);
    return true;
  } catch (error) {
    console.log('❌ Cloudflared not found. Installing...');
    return false;
  }
}

// Function to install Cloudflared
function installCloudflared() {
  console.log('📥 Installing Cloudflared...');
  try {
    // Detect OS
    const platform = process.platform;
    
    if (platform === 'win32') {
      console.log('🪟 Windows detected. Please download Cloudflared manually:');
      console.log('📥 https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe');
    } else if (platform === 'linux') {
      execSync('wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb', { stdio: 'inherit' });
      execSync('sudo dpkg -i cloudflared-linux-amd64.deb', { stdio: 'inherit' });
      console.log('✅ Cloudflared installed successfully');
    } else {
      console.log('❌ Unsupported platform. Please install Cloudflared manually.');
    }
  } catch (error) {
    console.log('❌ Failed to install Cloudflared:', error.message);
  }
}

// Function to setup environment
function setupEnvironment() {
  console.log('\n🔧 Setting up environment...');
  
  try {
    // Copy production environment
    const envProdPath = path.join(__dirname, '..', 'env.production');
    const envPath = path.join(__dirname, '..', '.env');
    
    if (fs.existsSync(envProdPath)) {
      fs.copyFileSync(envProdPath, envPath);
      console.log('✅ Production environment configured');
    } else {
      console.log('❌ env.production not found');
    }
  } catch (error) {
    console.log('❌ Failed to setup environment:', error.message);
  }
}

// Function to install dependencies
function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed');
  } catch (error) {
    console.log('❌ Failed to install dependencies:', error.message);
  }
}

// Function to create PM2 config
function createPM2Config() {
  console.log('\n📝 Creating PM2 configuration...');
  
  const pm2Config = {
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
      env_file: '.env'
    }]
  };

  const configPath = path.join(__dirname, '..', 'ecosystem.config.js');
  fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(pm2Config, null, 2)}`);
  console.log('✅ PM2 configuration created');
}

// Function to create startup script
function createStartupScript() {
  console.log('\n📝 Creating startup script...');
  
  const scriptContent = `#!/bin/bash
echo "Starting IWIZ Inventory Management System with Cloudflare Tunnel..."

# Load environment variables
export $(cat .env | xargs)

# Set production environment
export NODE_ENV=production

# Start the server
node server.js
`;

  const scriptPath = path.join(__dirname, '..', 'start-cloudflare.sh');
  fs.writeFileSync(scriptPath, scriptContent);
  fs.chmodSync(scriptPath, '755');
  console.log('✅ Startup script created: start-cloudflare.sh');
}

// Function to create Cloudflare config template
function createCloudflareConfig() {
  console.log('\n📝 Creating Cloudflare config template...');
  
  const configContent = `# Cloudflare Tunnel Configuration
# Replace YOUR_TUNNEL_ID with your actual tunnel ID

tunnel: YOUR_TUNNEL_ID
credentials-file: ~/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: your-app-name.trycloudflare.com
    service: http://localhost:5000
  - service: http_status:404
`;

  const configPath = path.join(__dirname, '..', 'cloudflare-config.yml');
  fs.writeFileSync(configPath, configContent);
  console.log('✅ Cloudflare config template created: cloudflare-config.yml');
}

// Main setup function
function main() {
  console.log('🔍 Checking prerequisites...\n');
  
  // Check Node.js
  if (!checkNodeJS()) {
    return;
  }
  
  // Check Cloudflared
  if (!checkCloudflared()) {
    installCloudflared();
  }
  
  // Setup environment
  setupEnvironment();
  
  // Install dependencies
  installDependencies();
  
  // Create PM2 config
  createPM2Config();
  
  // Create startup script
  createStartupScript();
  
  // Create Cloudflare config template
  createCloudflareConfig();
  
  console.log('\n🎉 Server setup completed!');
  console.log('\n📖 Next steps:');
  console.log('1. Authenticate with Cloudflare: cloudflared tunnel login');
  console.log('2. Create a tunnel: cloudflared tunnel create iwiz-inventory-backend');
  console.log('3. Update cloudflare-config.yml with your tunnel ID');
  console.log('4. Start the tunnel: cloudflared tunnel run iwiz-inventory-backend');
  console.log('5. Start the backend: npm start (or pm2 start ecosystem.config.js)');
  console.log('\n📁 Files created:');
  console.log('   • .env (production environment)');
  console.log('   • ecosystem.config.js (PM2 configuration)');
  console.log('   • start-cloudflare.sh (startup script)');
  console.log('   • cloudflare-config.yml (Cloudflare config template)');
}

// Run setup if called directly
if (require.main === module) {
  main();
}

module.exports = {
  checkNodeJS,
  checkCloudflared,
  installCloudflared,
  setupEnvironment,
  installDependencies,
  createPM2Config,
  createStartupScript,
  createCloudflareConfig
};

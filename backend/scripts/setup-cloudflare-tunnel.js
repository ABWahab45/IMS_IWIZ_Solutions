#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Cloudflare Tunnel Configuration...\n');

// Function to read and update environment file
function updateEnvFile(envPath, updates) {
  try {
    let content = fs.readFileSync(envPath, 'utf8');
    
    // Apply updates
    Object.keys(updates).forEach(key => {
      const regex = new RegExp(`^${key}=.*`, 'm');
      const newLine = `${key}=${updates[key]}`;
      
      if (regex.test(content)) {
        content = content.replace(regex, newLine);
      } else {
        content += `\n${newLine}`;
      }
    });
    
    fs.writeFileSync(envPath, content);
    console.log(`✅ Updated ${envPath}`);
  } catch (error) {
    console.error(`❌ Error updating ${envPath}:`, error.message);
  }
}

// Function to create .env file from env.config
function createEnvFile() {
  try {
    const envConfigPath = path.join(__dirname, '..', 'env.config');
    const envPath = path.join(__dirname, '..', '.env');
    
    if (fs.existsSync(envConfigPath)) {
      const content = fs.readFileSync(envConfigPath, 'utf8');
      fs.writeFileSync(envPath, content);
      console.log('✅ Created .env file from env.config');
    } else {
      console.log('⚠️  env.config not found, creating basic .env file');
      const basicEnv = `# Basic Environment Configuration
MONGODB_URI=mongodb+srv://AbdulWahab:Qwerty1122%40@cluster0.8apfguz.mongodb.net/iwiz_inventory?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
NODE_ENV=production
JWT_SECRET=5a70d35684296d99997ae2e7fb1cf9bd77ee8e1f4890c4c4c8da021a6291c1c5b210f165b7086b39fe4e8d58bc86af4470c156097d0b6c4213cb01021b1d5b27
JWT_EXPIRE=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
CLOUDINARY_CLOUD_NAME=dermm8zsk
CLOUDINARY_API_KEY=967688844686185
CLOUDINARY_API_SECRET=PuLX6WNIXYLIc8eSSyF-fSqYy6E`;
      fs.writeFileSync(envPath, basicEnv);
    }
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }
}

// Function to validate environment variables
function validateEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env file not found. Run setup first.');
      return false;
    }
    
    require('dotenv').config({ path: envPath });
    
    const requiredVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ];
    
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.log('❌ Missing required environment variables:', missing.join(', '));
      return false;
    }
    
    console.log('✅ Environment variables validated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error validating environment:', error.message);
    return false;
  }
}

// Function to create startup script
function createStartupScript() {
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
  console.log('✅ Created startup script: start-cloudflare.sh');
}

// Function to create PM2 configuration
function createPM2Config() {
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
  console.log('✅ Created PM2 configuration: ecosystem.config.js');
}

// Main setup function
function main() {
  console.log('📋 Setup Options:');
  console.log('1. Setup for Cloudflare Tunnel (Production)');
  console.log('2. Setup for Local Development');
  console.log('3. Validate Environment');
  console.log('4. Create Startup Scripts');
  console.log('5. All of the above');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\nSelect option (1-5): ', (answer) => {
    rl.close();
    
    switch (answer.trim()) {
      case '1':
        console.log('\n🔧 Setting up for Cloudflare Tunnel...');
        createEnvFile();
        updateEnvFile(path.join(__dirname, '..', '.env'), {
          NODE_ENV: 'production'
        });
        break;
        
      case '2':
        console.log('\n🔧 Setting up for Local Development...');
        createEnvFile();
        updateEnvFile(path.join(__dirname, '..', '.env'), {
          NODE_ENV: 'development'
        });
        break;
        
      case '3':
        console.log('\n🔍 Validating Environment...');
        validateEnv();
        break;
        
      case '4':
        console.log('\n📝 Creating Startup Scripts...');
        createStartupScript();
        createPM2Config();
        break;
        
      case '5':
        console.log('\n🚀 Complete Setup...');
        createEnvFile();
        updateEnvFile(path.join(__dirname, '..', '.env'), {
          NODE_ENV: 'production'
        });
        validateEnv();
        createStartupScript();
        createPM2Config();
        break;
        
      default:
        console.log('❌ Invalid option');
        process.exit(1);
    }
    
    console.log('\n✨ Setup completed!');
    console.log('\n📖 Next steps:');
    console.log('1. Install dependencies: npm install');
    console.log('2. Start the server: npm start');
    console.log('3. For Cloudflare tunnel, use: ./start-cloudflare.sh');
    console.log('4. For PM2: pm2 start ecosystem.config.js');
  });
}

// Run setup if called directly
if (require.main === module) {
  main();
}

module.exports = {
  createEnvFile,
  validateEnv,
  createStartupScript,
  createPM2Config
};

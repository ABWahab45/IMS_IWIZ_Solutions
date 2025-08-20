const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// CORS configuration for production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://iwiz-inventory.vercel.app', 
      'https://iwiz-inventory-git-main.vercel.app',
      'https://ims-iwiz-solutions.vercel.app',
      'https://ims-iwiz-solutions-git-main.vercel.app',
      'https://ims-iwiz-solutions-abwahabs-projects.vercel.app',
      'https://ims-iwiz-solutions-git-main-abwahabs-projects.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://192.168.1.10:3000',
      'http://192.168.1.10:3001',
      'https://192.168.1.10:3000',
      'https://192.168.1.10:3001'
    ];
    
    // Allow all Vercel domains
    if (origin.includes('vercel.app')) {
      console.log('✅ Allowing Vercel domain:', origin);
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle preflight requests
app.options('*', cors());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'HTTPS Server is running (Production Mode)',
    timestamp: new Date().toISOString(),
    environment: 'production',
    port: PORT,
    origin: req.headers.origin,
    serverIP: '192.168.1.10',
    protocol: 'https'
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'HTTPS CORS is working! (Production Mode)',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    serverIP: '192.168.1.10',
    protocol: 'https'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'HTTPS Production server is working perfectly!',
    server: 'HTTPS Production Test Server',
    port: PORT,
    timestamp: new Date().toISOString(),
    environment: 'production',
    serverIP: '192.168.1.10',
    protocol: 'https'
  });
});

// Simulate auth endpoint
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'HTTPS Login endpoint working (Production Mode)',
    token: 'test-token-production-https',
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin'
    },
    serverIP: '192.168.1.10',
    protocol: 'https'
  });
});

// Simulate products endpoint
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    message: 'HTTPS Products endpoint working (Production Mode)',
    products: [
      {
        id: '1',
        name: 'Test Product 1',
        description: 'This is a test product',
        price: 100,
        quantity: 50
      },
      {
        id: '2',
        name: 'Test Product 2',
        description: 'Another test product',
        price: 200,
        quantity: 25
      }
    ],
    serverIP: '192.168.1.10',
    protocol: 'https'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    serverIP: '192.168.1.10',
    protocol: 'https'
  });
});

// Create self-signed certificate for HTTPS
const createSelfSignedCert = () => {
  const certPath = path.join(__dirname, 'cert.pem');
  const keyPath = path.join(__dirname, 'key.pem');
  
  // Check if certificates already exist
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    console.log('✅ Using existing self-signed certificates');
    return {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath)
    };
  }
  
  console.log('⚠️  Self-signed certificates not found. Creating HTTP server instead...');
  return null;
};

const httpsOptions = createSelfSignedCert();

if (httpsOptions) {
  // Start HTTPS server
  https.createServer(httpsOptions, app).listen(PORT, '0.0.0.0', () => {
    console.log(`✅ HTTPS Production Test Server running on port ${PORT}`);
    console.log(`🔒 HTTPS URL: https://localhost:${PORT}`);
    console.log(`🔒 HTTPS Network URL: https://192.168.1.10:${PORT}`);
    console.log(`🔗 Ready for server deployment!`);
    console.log(`📋 Test endpoints:`);
    console.log(`   - https://localhost:${PORT}/api/health`);
    console.log(`   - https://192.168.1.10:${PORT}/api/health`);
    console.log(`   - https://localhost:${PORT}/api/cors-test`);
    console.log(`   - https://localhost:${PORT}/api/test`);
    console.log(`   - https://localhost:${PORT}/api/products`);
    console.log(`   - POST https://localhost:${PORT}/api/auth/login`);
    console.log(`\n🎯 This server is ready to be copied to their server PC!`);
    console.log(`\n🧪 Update Vercel environment variables to:`);
    console.log(`   REACT_APP_API_URL=https://192.168.1.10:${PORT}/api`);
    console.log(`   REACT_APP_BACKEND_URL=https://192.168.1.10:${PORT}`);
    console.log(`\n⚠️  Note: You'll need to accept the self-signed certificate warning in your browser`);
  });
} else {
  // Fallback to HTTP server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ HTTP Production Test Server running on port ${PORT}`);
    console.log(`🌐 HTTP URL: http://localhost:${PORT}`);
    console.log(`🌐 HTTP Network URL: http://192.168.1.10:${PORT}`);
    console.log(`\n⚠️  WARNING: Mixed content error will occur with Vercel!`);
    console.log(`\n🔧 Solutions:`);
    console.log(`1. Use ngrok with HTTPS: ngrok http 3000`);
    console.log(`2. Deploy to a server with proper SSL certificate`);
    console.log(`3. Use a reverse proxy with HTTPS`);
  });
}

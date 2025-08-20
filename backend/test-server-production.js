const express = require('express');
const cors = require('cors');

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
      'http://localhost:3000',
      'http://localhost:3001',
      'http://192.168.1.10:3000',
      'http://192.168.1.10:3001'
    ];
    
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
    message: 'Server is running (Production Mode)',
    timestamp: new Date().toISOString(),
    environment: 'production',
    port: PORT,
    origin: req.headers.origin,
    serverIP: '192.168.1.10'
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working! (Production Mode)',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    serverIP: '192.168.1.10'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Production server is working perfectly!',
    server: 'Production Test Server',
    port: PORT,
    timestamp: new Date().toISOString(),
    environment: 'production',
    serverIP: '192.168.1.10'
  });
});

// Simulate auth endpoint
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login endpoint working (Production Mode)',
    token: 'test-token-production',
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin'
    },
    serverIP: '192.168.1.10'
  });
});

// Simulate products endpoint
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    message: 'Products endpoint working (Production Mode)',
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
    serverIP: '192.168.1.10'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    serverIP: '192.168.1.10'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Production Test Server running on port ${PORT}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`🌐 Network URL: http://192.168.1.10:${PORT}`);
  console.log(`🔗 Ready for server deployment!`);
  console.log(`📋 Test endpoints:`);
  console.log(`   - http://localhost:${PORT}/api/health`);
  console.log(`   - http://192.168.1.10:${PORT}/api/health`);
  console.log(`   - http://localhost:${PORT}/api/cors-test`);
  console.log(`   - http://localhost:${PORT}/api/test`);
  console.log(`   - http://localhost:${PORT}/api/products`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`\n🎯 This server is ready to be copied to their server PC!`);
  console.log(`\n🧪 Test from Vercel with these environment variables:`);
  console.log(`   REACT_APP_API_URL=http://192.168.1.10:${PORT}/api`);
  console.log(`   REACT_APP_BACKEND_URL=http://192.168.1.10:${PORT}`);
});

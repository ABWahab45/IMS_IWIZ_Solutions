const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import upload configurations
const { uploadConfigs, handleMulterError } = require('./middleware/upload');

// Debug environment variables
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set');

const app = express();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Note: Upload directories are no longer needed as we're using Cloudinary

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://iwiz-inventory.vercel.app', 
      'https://iwiz-inventory-git-main.vercel.app',
      'https://ims-iwiz-solutions.vercel.app',
      'https://ims-iwiz-solutions-git-main.vercel.app',
      'https://iwiz-inventory.vercel.app',
      'https://iwiz-inventory-git-main.vercel.app'
    ]
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
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

// Note: Static file serving for uploads is no longer needed as we're using Cloudinary

// Handle preflight requests
app.options('*', cors());

// Connect to MongoDB with timeout and retry
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 10 seconds timeout
  socketTimeoutMS: 45000, // 45 seconds timeout
  connectTimeoutMS: 10000 // 10 seconds timeout
});

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  console.error('Error details:', err.message);
});

db.on('connected', () => {
  console.log('MongoDB connected successfully');
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

db.once('open', () => {
  console.log('MongoDB connection opened');
});

if (NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    allowedOrigins: allowedOrigins
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Configuration test endpoint
app.get('/api/config-test', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'Not Set',
      apiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set'
    },
    mongodb: process.env.MONGODB_URI ? 'Set' : 'Not Set',
    timestamp: new Date().toISOString()
  });
});

// Avatar upload test endpoint
app.post('/api/test-avatar-upload', uploadConfigs.avatar, handleMulterError, (req, res) => {
  try {
    console.log('Test avatar upload - Request received');
    console.log('Files:', req.file);
    console.log('Body:', req.body);
    
    if (req.file) {
      res.json({
        success: true,
        message: 'Avatar upload test successful',
        file: {
          path: req.file.path,
          filename: req.file.filename,
          originalname: req.file.originalname
        }
      });
    } else {
      res.json({
        success: false,
        message: 'No file uploaded'
      });
    }
  } catch (error) {
    console.error('Test avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Test upload failed',
      error: error.message
    });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/handovers', require('./routes/handovers'));

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Add startup timeout to prevent infinite hanging
const startupTimeout = setTimeout(() => {
  console.error('Startup timeout reached. Server failed to start within 30 seconds.');
  process.exit(1);
}, 30000);

const server = app.listen(PORT, () => {
  clearTimeout(startupTimeout);
  console.log(`Server running on port ${PORT}`);
  console.log('IWIZ Solutions Inventory Management System');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('MongoDB URI set:', !!process.env.MONGODB_URI);
  console.log('Cloudinary configured:', !!process.env.CLOUDINARY_CLOUD_NAME);
});

// Add error handling for server
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error('Port is already in use');
  }
});

// Add graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
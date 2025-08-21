#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('../models/Product');

// Get the Counter model that's already defined in Product.js
const Counter = mongoose.model('Counter');

async function resetProductCounter() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the current highest product ID
    const highestProduct = await Product.findOne().sort({ productId: -1 });
    const currentCount = highestProduct ? highestProduct.productId : 0;
    
    console.log(`📊 Current highest product ID: ${currentCount}`);

    // Count total products
    const totalProducts = await Product.countDocuments();
    console.log(`📦 Total products in database: ${totalProducts}`);

    if (totalProducts === 0) {
      console.log('📝 No products found. Resetting counter to 0...');
      await Counter.findByIdAndUpdate('productId', { seq: 0 }, { upsert: true });
      console.log('✅ Counter reset to 0');
    } else {
      // Reset counter to the number of existing products
      console.log(`🔄 Resetting counter to ${totalProducts}...`);
      await Counter.findByIdAndUpdate('productId', { seq: totalProducts }, { upsert: true });
      console.log(`✅ Counter reset to ${totalProducts}`);
    }

    // Verify the reset
    const counter = await Counter.findById('productId');
    console.log(`✅ New counter value: ${counter.seq}`);

    console.log('\n🎉 Product ID counter reset successfully!');
    console.log('📝 Next new product will have ID:', counter.seq + 1);

  } catch (error) {
    console.error('❌ Error resetting product counter:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
resetProductCounter();

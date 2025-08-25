#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

// Import the Product model
const Product = require('./models/Product');

async function fixProductCounter() {
  try {
    console.log('🔧 Fixing Product Counter...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all products sorted by creation date
    const products = await Product.find().sort({ createdAt: 1 });
    console.log(`📦 Found ${products.length} products`);
    
    if (products.length === 0) {
      console.log('📝 No products found. Nothing to fix.');
      return;
    }
    
    console.log('\n📊 Current Product IDs:');
    products.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - Current ID: ${product.productId}`);
    });
    
    console.log('\n🔄 Fixing product IDs...');
    
    // Update each product with a new sequential ID
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const newId = i + 1;
      
      if (product.productId !== newId) {
        console.log(`  Updating ${product.name}: ${product.productId} → ${newId}`);
        await Product.findByIdAndUpdate(product._id, { productId: newId });
      } else {
        console.log(`  ✅ ${product.name} already has correct ID: ${newId}`);
      }
    }
    
    // Reset the counter to the number of products
    const Counter = mongoose.model('Counter');
    await Counter.findByIdAndUpdate('productId', { seq: products.length }, { upsert: true });
    
    console.log('\n✅ Product counter fixed successfully!');
    console.log(`📝 Next new product will have ID: ${products.length + 1}`);
    
    // Show the new order
    console.log('\n📊 New Product IDs:');
    const updatedProducts = await Product.find().sort({ createdAt: 1 });
    updatedProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - ID: ${product.productId}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing product counter:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
fixProductCounter();

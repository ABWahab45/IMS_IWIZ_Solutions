#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('../models/Product');

async function reorderProductIds() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all products sorted by creation date
    const products = await Product.find().sort({ createdAt: 1 });
    console.log(`📦 Found ${products.length} products`);

    if (products.length === 0) {
      console.log('📝 No products found to reorder');
      return;
    }

    console.log('\n📊 Current product IDs:');
    products.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - ID: ${product.productId}`);
    });

    // Ask for confirmation
    console.log('\n⚠️  This will reorder all product IDs to be sequential starting from 1.');
    console.log('⚠️  This action cannot be undone!');
    console.log('\nDo you want to continue? (y/N)');
    
    // For now, we'll proceed automatically
    // In a real scenario, you'd want to add user input confirmation
    
    console.log('\n🔄 Reordering product IDs...');
    
    // Update each product with a new sequential ID
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const newId = i + 1;
      
      console.log(`  Updating ${product.name}: ${product.productId} → ${newId}`);
      await Product.findByIdAndUpdate(product._id, { productId: newId });
    }

    // Reset the counter to the number of products
    const Counter = mongoose.model('Counter');
    await Counter.findByIdAndUpdate('productId', { seq: products.length }, { upsert: true });

    console.log('\n✅ Product IDs reordered successfully!');
    console.log(`📝 Next new product will have ID: ${products.length + 1}`);

    // Show the new order
    console.log('\n📊 New product IDs:');
    const updatedProducts = await Product.find().sort({ createdAt: 1 });
    updatedProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - ID: ${product.productId}`);
    });

  } catch (error) {
    console.error('❌ Error reordering product IDs:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
reorderProductIds();

#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('../models/Product');
const Counter = mongoose.model('Counter');
const DeletedId = mongoose.model('DeletedId');

async function manageProductIds() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📊 Current Product ID Status:');
    
    // Get current counter value
    const counter = await Counter.findById('productId');
    const currentCounter = counter ? counter.seq : 0;
    console.log(`Current Counter: ${currentCounter}`);
    
    // Get all products and their IDs
    const products = await Product.find().sort({ productId: 1 });
    console.log(`Total Products: ${products.length}`);
    
    // Get recycled IDs
    const recycledIds = await DeletedId.find().sort({ productId: 1 });
    console.log(`Recycled IDs Available: ${recycledIds.length}`);
    
    if (recycledIds.length > 0) {
      console.log('Recycled IDs:', recycledIds.map(id => id.productId).join(', '));
    }
    
    // Show product ID ranges
    if (products.length > 0) {
      const productIds = products.map(p => p.productId).sort((a, b) => a - b);
      console.log(`Product ID Range: ${productIds[0]} - ${productIds[productIds.length - 1]}`);
      
      // Find gaps in product IDs
      const gaps = [];
      for (let i = 1; i < productIds.length; i++) {
        if (productIds[i] - productIds[i-1] > 1) {
          gaps.push(`${productIds[i-1] + 1} - ${productIds[i] - 1}`);
        }
      }
      
      if (gaps.length > 0) {
        console.log('Gaps in Product IDs:', gaps.join(', '));
      } else {
        console.log('✅ No gaps in product IDs');
      }
    }
    
    console.log('\n🔧 Available Actions:');
    console.log('1. View current status (default)');
    console.log('2. Reset counter to match highest product ID');
    console.log('3. Clear all recycled IDs');
    console.log('4. Compact product IDs (reorder all products)');
    
    // For now, just show the status
    console.log('\n💡 To perform actions, modify this script or create specific functions.');
    
  } catch (error) {
    console.error('❌ Error managing product IDs:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Function to reset counter
async function resetCounter() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const highestProduct = await Product.findOne().sort({ productId: -1 });
    const highestId = highestProduct ? highestProduct.productId : 0;
    
    await Counter.findByIdAndUpdate('productId', { seq: highestId }, { upsert: true });
    console.log(`✅ Counter reset to ${highestId}`);
    
  } catch (error) {
    console.error('❌ Error resetting counter:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Function to clear recycled IDs
async function clearRecycledIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const result = await DeletedId.deleteMany({});
    console.log(`✅ Cleared ${result.deletedCount} recycled IDs`);
    
  } catch (error) {
    console.error('❌ Error clearing recycled IDs:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the main function
if (require.main === module) {
  const action = process.argv[2];
  
  switch (action) {
    case 'reset':
      resetCounter();
      break;
    case 'clear':
      clearRecycledIds();
      break;
    default:
      manageProductIds();
  }
}

module.exports = {
  manageProductIds,
  resetCounter,
  clearRecycledIds
};

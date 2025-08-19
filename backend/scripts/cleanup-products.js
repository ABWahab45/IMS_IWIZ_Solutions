const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iwiz_inventory';

async function cleanupProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Find all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    // Remove dimensions and supplier fields from all products
    for (const product of products) {
      // Remove the fields from the document
      if (product.dimensions) {
        delete product.dimensions;
      }
      if (product.supplier) {
        delete product.supplier;
      }
      
      await product.save();
      console.log(`Cleaned up product: ${product.name} (ID: ${product._id})`);
    }

    console.log('\n✅ All products have been cleaned up');
    console.log('Dimensions and supplier fields have been removed from all products');

  } catch (error) {
    console.error('Error cleaning up products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
cleanupProducts();

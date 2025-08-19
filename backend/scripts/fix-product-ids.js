const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iwiz_inventory';

async function fixProductIds() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Find all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    // Check for duplicate productIds
    const productIdMap = new Map();
    const duplicates = [];

    for (const product of products) {
      if (product.productId) {
        if (productIdMap.has(product.productId)) {
          duplicates.push({
            product: product,
            existingProduct: productIdMap.get(product.productId)
          });
        } else {
          productIdMap.set(product.productId, product);
        }
      }
    }

    console.log(`Found ${duplicates.length} duplicate product IDs`);

    // Fix duplicates by assigning new unique IDs
    for (const duplicate of duplicates) {
      const newProductId = Date.now() + Math.floor(Math.random() * 1000);
      duplicate.product.productId = newProductId;
      await duplicate.product.save();
      console.log(`Fixed duplicate ID for product: ${duplicate.product.name} (New ID: ${newProductId})`);
    }

    // Ensure all products have a productId
    for (const product of products) {
      if (!product.productId) {
        const newProductId = Date.now() + Math.floor(Math.random() * 1000);
        product.productId = newProductId;
        await product.save();
        console.log(`Assigned new ID to product: ${product.name} (New ID: ${newProductId})`);
      }
    }

    console.log('\n✅ All product IDs have been fixed');
    console.log('No more duplicate product IDs');

  } catch (error) {
    console.error('Error fixing product IDs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
fixProductIds();

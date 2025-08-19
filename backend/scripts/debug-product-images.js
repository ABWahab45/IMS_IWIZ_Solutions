const mongoose = require('mongoose');
const Product = require('../models/Product');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'env.config') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const debugProductImages = async () => {
  try {
    console.log('Debugging product images...\n');
    
    const products = await Product.find({}).select('name images').lean();
    
    console.log(`Found ${products.length} products:\n`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. Product: ${product.name}`);
      console.log(`   Images:`, product.images);
      console.log(`   Images length: ${product.images ? product.images.length : 0}`);
      
      if (product.images && product.images.length > 0) {
        product.images.forEach((image, imgIndex) => {
          console.log(`   Image ${imgIndex + 1}:`, image);
          console.log(`   Image URL:`, image.url);
          console.log(`   Is URL:`, typeof image.url === 'string' && (image.url.startsWith('http://') || image.url.startsWith('https://')));
        });
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    mongoose.connection.close();
  }
};

debugProductImages();

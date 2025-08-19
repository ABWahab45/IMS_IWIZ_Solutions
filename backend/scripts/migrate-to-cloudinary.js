const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'env.config') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const migrateData = async () => {
  try {
    console.log('Starting migration to Cloudinary...');

    // Update users with missing avatars
    const usersWithLocalAvatars = await User.find({
      avatar: { $exists: true, $ne: '' },
      $or: [
        { avatar: { $not: /^https?:\/\// } }, // Not a URL
        { avatar: { $regex: /uploads\// } }   // Contains uploads path
      ]
    });

    console.log(`Found ${usersWithLocalAvatars.length} users with local avatars`);

    for (const user of usersWithLocalAvatars) {
      // Set a default avatar or placeholder
      user.avatar = 'https://via.placeholder.com/300x300?text=Avatar+Not+Found';
      await user.save();
      console.log(`Updated user: ${user.email}`);
    }

    // Update products with missing images
    const productsWithLocalImages = await Product.find({
      $or: [
        { images: { $exists: false } },
        { images: { $size: 0 } },
        { 'images.url': { $exists: true, $ne: '' } },
        { 'images.url': { $regex: /uploads\// } }   // Contains uploads path
      ]
    });

    console.log(`Found ${productsWithLocalImages.length} products with local images`);

    for (const product of productsWithLocalImages) {
      // Set a default product image
      product.images = [{
        url: 'https://via.placeholder.com/800x600?text=Product+Image+Not+Found',
        alt: 'Product Image Not Found',
        isPrimary: true
      }];
      await product.save();
      console.log(`Updated product: ${product.name}`);
    }

    console.log('Migration completed successfully!');
    console.log('Note: All local image references have been replaced with placeholder images.');
    console.log('New uploads will be stored in Cloudinary.');

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run migration if this script is executed directly
if (require.main === module) {
  migrateData();
}

module.exports = migrateData;

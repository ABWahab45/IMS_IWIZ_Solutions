const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Schema to track deleted product IDs for recycling
const deletedIdSchema = new mongoose.Schema({
  productId: { type: Number, required: true, unique: true },
  deletedAt: { type: Date, default: Date.now }
});

const DeletedId = mongoose.model('DeletedId', deletedIdSchema);

const productSchema = new mongoose.Schema({
  productId: {
    type: Number,
    unique: true,
    required: false,
    sparse: true // Allow multiple null values
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    cost: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative']
    },
    selling: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative']
    },
    currency: {
      type: String,
      default: 'PKR',
      enum: ['PKR']
    }
  },
  stock: {
    quantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0
    },
    minStock: {
      type: Number,
      default: 0,
      min: [0, 'Minimum stock cannot be negative']
    },
    maxStock: {
      type: Number,
      default: 1000,
      min: [0, 'Maximum stock cannot be negative']
    },
    unit: {
      type: String,
      default: 'pcs',
      enum: ['pcs', 'kg', 'lbs', 'liters', 'meters', 'boxes']
    },
    location: {
      type: String,
      trim: true
    },
    lastRestocked: {
      type: Date,
      default: Date.now
    }
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  expiryDate: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-increment function with ID recycling
productSchema.pre('save', async function(next) {
  if (this.isNew && !this.productId) {
    try {
      // First, try to get the lowest available deleted ID
      const deletedId = await DeletedId.findOne().sort({ productId: 1 });
      
      if (deletedId) {
        // Use the recycled ID
        this.productId = deletedId.productId;
        // Remove the ID from deleted IDs collection
        await DeletedId.findByIdAndDelete(deletedId._id);
        console.log(`♻️ Recycled product ID: ${this.productId}`);
      } else {
        // No recycled IDs available, increment counter
        const counter = await Counter.findByIdAndUpdate(
          'productId',
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        this.productId = counter.seq;
        console.log(`🆕 Generated new product ID: ${this.productId}`);
      }
    } catch (error) {
      console.error('Error generating product ID:', error);
      // If counter fails, use timestamp as fallback
      this.productId = Date.now();
    }
  }
  
  if (this.isModified('stock.quantity')) {
    this.stock.lastRestocked = new Date();
  }
  next();
});

// Simple indexes for better performance
productSchema.index({ name: 1 });
productSchema.index({ productId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ 'stock.quantity': 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 1, status: 1 });
productSchema.index({ 'stock.quantity': 1, status: 1 });

productSchema.virtual('isOutOfStock').get(function() {
  return this.stock.quantity === 0;
});

productSchema.virtual('profitMargin').get(function() {
  if (this.price.cost > 0) {
    return ((this.price.selling - this.price.cost) / this.price.cost) * 100;
  }
  return 0;
});

module.exports = mongoose.model('Product', productSchema);
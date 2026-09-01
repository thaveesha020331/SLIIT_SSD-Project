import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      validate: {
        validator: function (value) {
          return value > 0;
        },
        message: 'Price must be greater than 0',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: 'Stock must be greater than or equal to 0',
      },
      default: 0,
    },
    category: {
      type: String,
      enum: ['Reusable', 'Organic', 'Handmade', 'Biodegradable', 'Sustainable', 'Ecofriendly'],
      required: [true, 'Category is required'],
    },
    productCategory: {
      type: String,
      enum: ['Kitchen', 'Personal Care', 'Bags & School Items', 'Home & Living', 'Gifts'],
      required: [true, 'Product category is required'],
    },
    image: {
      type: String,
      required: [true, 'Product image is required'],
    },
    imagePath: {
      type: String,
      default: null,
    },
    ecocertification: {
      type: String,
      required: [true, 'Eco-certification is required'],
      enum: ['FSC', 'USDA Organic', 'Fair Trade', 'Carbon Neutral', 'B Corp', 'Cradle to Cradle', 'EU Ecolabel', 'Green Seal'],
    },
    ecoImpactScore: {
      carbonFootprint: {
        type: Number,
        default: 0,
        description: 'Carbon footprint in kg CO2e',
      },
      sustainabilityRating: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
        description: 'Sustainability rating percentage (0-100)',
      },
      waterUsage: {
        type: Number,
        default: 0,
        description: 'Water usage in liters',
      },
      recyclabilityScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    manufacturerInfo: {
      name: String,
      location: String,
      certifications: [String],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },
    reviews: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ productCategory: 1, isActive: 1 });
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ ecocertification: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;

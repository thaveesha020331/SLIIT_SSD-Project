import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['admin', 'seller', 'customer'],
    default: 'customer',
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  themePreference: {
    type: String,
    enum: ['light', 'dark', 'green'],
    default: 'light',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  profileImage: {
    type: String,
    default: '',
  },
  paymentCard: {
    preferredPaymentMethod: {
      type: String,
      enum: ['card', 'cash_on_delivery'],
      default: 'cash_on_delivery',
    },
    billingName: {
      type: String,
      trim: true,
      default: '',
    },
    billingAddress: {
      type: String,
      trim: true,
      default: '',
    },
    cardNumberLast4: {
      type: String,
      match: [/^\d{4}$/, 'Card number must contain exactly 4 digits'],
      default: '',
    },
    cardBrand: {
      type: String,
      trim: true,
      default: '',
    },
    expiryMonth: {
      type: Number,
      min: 1,
      max: 12,
      default: null,
    },
    expiryYear: {
      type: Number,
      min: 2000,
      max: 2100,
      default: null,
    },
    updatedAt: {
      type: Date,
      default: null,
    },
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if password is correct
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get user info without sensitive data
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;

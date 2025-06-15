const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const addressSchema = require('./address.model'); // Import the schema



const geoPoint = {
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], default: [0, 0] }
};

const restaurantDetailsSchema = new mongoose.Schema({
  name: { type: String },
  description: { type: String },
  cuisineType: [String],
  
  address: { type: String },
  location: geoPoint,
  businessHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  isOpen: { type: Boolean, default: false },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String
  },
  documentsUploaded: { type: Boolean, default: false },
documentUrls: [String], // Add inside restaurantDetailsSchema
image: { type: String, default: '' }, // Restaurant image URL
rating: { type: Number, default: 4.3 }, // Default rating
ratingCount: { type: Number, default: 0 }, // Number of ratings
categories: [{ type: String }], // e.g. ["North Indian", "Chinese"]
minOrder: { type: Number, default: 100 }, // Minimum order value
deliveryTime: { type: Number, default: 30 }, // Estimated delivery time in minutes
deliveryFee: { type: Number, default: 40 } // Delivery fee


}, { _id: false });

const deliveryDetailsSchema = new mongoose.Schema({
  currentLocation: geoPoint,
  isAvailable: { type: Boolean, default: false },
  vehicleType: { type: String },
  vehicleNumber: { type: String },
  documentsUploaded: { type: Boolean, default: false },
  documentUrls: [String],
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: false, // allow customers to not have email initially
    unique: true, 
    sparse: true // allow multiple docs with null
  },
  phone: { type: String, required: true, unique: true },
  password: { 
    type: String, 
    required: function() { return this.role !== 'customer'; } 
  },
  role: { 
    type: String, 
    enum: ['admin', 'customer', 'restaurant', 'delivery'], 
    default: 'customer' 
  },
  isVerified: { type: Boolean, default: false },
  isApproved: { 
    type: Boolean, 
    default: function() { 
      return this.role === 'customer' || this.role === 'admin'; 
    }
  },
  addresses: { type: [addressSchema], default: [] }, // Always default to empty array
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'blocked', 'pending'], 
    default: 'active' 
  },
  isPopular: { type: Boolean, default: false }, // <-- Add this line
  restaurantDetails: restaurantDetailsSchema,
  deliveryDetails: deliveryDetailsSchema,
  refreshToken: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  favouriteRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // restaurant _id
  favouriteFoodItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // product _id
  disabledPaymentMethods: [{ type: String }] // e.g., ['COD']
});

// Indexes
userSchema.index({ 'restaurantDetails.location': '2dsphere' });
userSchema.index({ 'deliveryDetails.currentLocation': '2dsphere' });

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  const user = this;
  if (!user.isModified('password') || !user.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;


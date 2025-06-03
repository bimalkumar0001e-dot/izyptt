// Customer Cart Model (models/cart.model.js)
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  restaurant: {
    type: String,
    required: false,  // Make it completely optional
    default: null     // Explicitly set default to null
  }
});

const cartSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  appliedOffer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Calculate cart totals
cartSchema.methods.calculateTotals = function() {
  let subtotal = 0;
  
  // Calculate subtotal
  this.items.forEach(item => {
    subtotal += item.price * item.quantity;
  });
  
  return {
    subtotal,
    itemCount: this.items.length,
    totalQuantity: this.items.reduce((sum, item) => sum + item.quantity, 0)
  };
};

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
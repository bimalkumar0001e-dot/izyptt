const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId, // <-- changed from String to ObjectId
    ref: 'User', // <-- reference to User (restaurant)
    required: false, // Changed from true to false to make it optional
    default: null
  },
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Users with role 'delivery'
    default: null
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
 appliedOffer: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Offer',
  default: null
},
  deliveryAddress: {
    address: { type: String, required: true },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'online'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: [
      'placed', 
      'confirmed', 
      'preparing', 
      'packing', // <-- added
      'packed',   // <-- added (optional, remove if not needed)
      'ready', 
      'picked', 
      'on_the_way',
      'delayed',
      'delivered', 
      'cancelled',
      // Add all admin statuses below
      'delayed_high_demand',
      'delayed_weather',
      'delayed_rider_assigned_late',
      'delayed_rider_unavailable',
      'cancelled_by_customer',
      'cancelled_by_admin',
      'cancelled_payment_failed',
      'delivery_failed_wrong_address',
      'delivery_failed_no_response',
      'on_hold',
      'refund_issued'
    ],
    default: 'placed'
  },
  statusTimeline: [{
    status: {
      type: String,
      enum: [
        'placed', 
        'confirmed', 
        'preparing', 
        'packing', // <-- added
        'packed',   // <-- added (optional, remove if not needed)
        'ready', 
        'picked', 
        'on_the_way',
        'delayed',
        'delivered', 
        'cancelled',
        // Add all admin statuses below
        'delayed_high_demand',
        'delayed_weather',
        'delayed_rider_assigned_late',
        'delayed_rider_unavailable',
        'cancelled_by_customer',
        'cancelled_by_admin',
        'cancelled_payment_failed',
        'delivery_failed_wrong_address',
        'delivery_failed_no_response',
        'on_hold',
        'refund_issued'
      ]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: null
    }
  }],
  cancellationReason: {
    type: String,
    default: null
  },
  cancellationTime: {
    type: Date,
    default: null
  },
  cancelledBy: {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  role: {
    type: String,
    enum: ['admin', 'customer', 'restaurant', 'delivery', 'system', null], // <-- add null here
    default: null
  }
},
  deliveryInstructions: {
    type: String,
    default: null
  },
  rating: {
    food: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    delivery: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    review: {
      type: String,
      default: null
    },
    ratedAt: {
      type: Date,
      default: null
    }
  },
  estimatedDeliveryTime: {
    type: Date,
    default: null
  },
  actualDeliveryTime: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
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

// Pre-save hook to generate order number
orderSchema.pre('validate', async function(next) {
  try {
    if (!this.orderNumber) {
      const date = new Date();
      const year = date.getFullYear().toString().substr(-2);
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      
      this.orderNumber = `ORD-${year}${month}${day}-${randomDigits}`;
    }
    
    // Add status change to timeline if status is modified
    if (this.isModified('status')) {
      this.statusTimeline.push({
        status: this.status,
        timestamp: new Date()
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Set deliveredAt when status changes to delivered
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  next();
});

// Indexes
orderSchema.index({ customer: 1 });
orderSchema.index({ restaurant: 1 });
orderSchema.index({ deliveryPartner: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: 1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
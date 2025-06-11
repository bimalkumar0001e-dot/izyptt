const mongoose = require('mongoose');
const deliveryFeeSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  minSubtotal: { type: Number, default: 0 }, // Minimum cart subtotal for this fee
  maxSubtotal: { type: Number } // Maximum cart subtotal for this fee (optional, undefined means no upper limit)
}, { timestamps: true });

module.exports = mongoose.model('DeliveryFee', deliveryFeeSchema);
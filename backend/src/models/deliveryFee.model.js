const mongoose = require('mongoose');
const deliveryFeeSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('DeliveryFee', deliveryFeeSchema);
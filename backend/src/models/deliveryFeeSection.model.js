const mongoose = require('mongoose');

const deliveryFeeSlabSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  minSubtotal: { type: Number, default: 0 },
  maxSubtotal: { type: Number }, // undefined = no upper limit
  isActive: { type: Boolean, default: true }
}, { _id: true });

const deliveryFeeSectionSchema = new mongoose.Schema({
  km: { type: Number, required: true },
  fees: [deliveryFeeSlabSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('DeliveryFeeSection', deliveryFeeSectionSchema);

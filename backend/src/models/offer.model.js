const mongoose = require('mongoose');

// Updated offer schema to match the required structure
const offerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g., "offer2"
  title: { type: String, required: true }, // e.g., "Weekend Special"
  code: { type: String, required: true, unique: true }, // e.g., "WEEKEND20"
  description: { type: String, required: true }, // e.g., "Get 20% off on your weekend orders"
  discountType: { type: String, enum: ['flat', 'percentage'], required: true }, // e.g., "percentage"
  discountValue: { type: Number, required: true }, // e.g., 20
  minOrderValue: { type: Number, default: 0 }, // e.g., 500
  maxDiscount: { type: Number }, // e.g., 200
  validFrom: { type: Date, required: true }, // e.g., new Date(2023, 0, 1)
  validTo: { type: Date, required: true }, // e.g., new Date(2025, 11, 31)
  isActive: { type: Boolean, default: true }, // e.g., true
  usageCount: { type: Number, default: 0 }, // e.g., 120
  limitedTo: { type: Number, default: null }, // e.g., 40 (null means unlimited)
  perCustomerLimit: { type: Number, default: 1 }, // e.g., 1 use per customer
  customerUsage: {
    type: Map,
    of: Number,
    default: {}
  }, // customerId -> usage count
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
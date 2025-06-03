const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  details: { type: String },
  description: { type: String }, // optional
  image: { type: String }, // optional, store image path
  paymentGuide: { type: String }, // optional
  instructions: { type: String }, // optional
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
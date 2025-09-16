const mongoose = require('mongoose');

const DeliveryTimeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  minDistance: { type: Number, required: true },
  maxDistance: { type: Number, required: true },
  minTime: { type: Number, required: true }, // in minutes
  maxTime: { type: Number, required: true }, // in minutes
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeliveryTime', DeliveryTimeSchema);
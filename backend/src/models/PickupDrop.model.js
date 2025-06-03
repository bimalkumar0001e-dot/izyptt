const mongoose = require('mongoose');

const pickupDropSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickupAddress: { type: String, required: true },
  dropAddress: { type: String, required: true },
  itemType: { type: String, enum: ['Lunchbox', 'Documents', 'Clothes', 'Others'], required: true },
  note: { type: String },
  // Allow all possible status values from frontend
  status: { 
    type: String, 
    enum: [
      'Pending', 
      'pending',
      'Accepted',
      'accepted',
      'Reached pickup location',
      'reached_pickup_location',
      'Picked Up',
      'picked',
      'picked_up',
      'On the Way to drop location',
      'on_the_way',
      'on_the_way_to_drop_location',
      'Delivered',
      'delivered',
      'Cancelled',
      'cancelled'
    ], 
    default: 'Pending' 
  },
  statusNote: { type: String }, // <-- Add this line
  deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  totalAmount: { type: Number, default: 0 }
});

// Prevent OverwriteModelError in watch mode or repeated imports
module.exports = mongoose.models.PickupDrop || mongoose.model('PickupDrop', pickupDropSchema);
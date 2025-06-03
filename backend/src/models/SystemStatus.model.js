const mongoose = require('mongoose');

const systemStatusSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['online', 'maintenance', 'offline'],
    default: 'online'
  },
  message: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemStatus', systemStatusSchema);

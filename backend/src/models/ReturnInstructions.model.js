const mongoose = require('mongoose');

const ReturnInstructionsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReturnInstructions', ReturnInstructionsSchema);

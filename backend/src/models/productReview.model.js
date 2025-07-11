const mongoose = require('mongoose');

const productReviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  reviewText: {
    type: String,
    trim: true,
    required: true
  },
  image: {
    type: String // single image URL/path
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Always populate createdBy with name when finding reviews
productReviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'createdBy',
    select: 'name'
  });
  next();
});

module.exports = mongoose.model('ProductReview', productReviewSchema);

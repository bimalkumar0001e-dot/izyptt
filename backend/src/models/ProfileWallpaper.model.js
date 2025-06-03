const mongoose = require('mongoose');

const ProfileWallpaperSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProfileWallpaper', ProfileWallpaperSchema);

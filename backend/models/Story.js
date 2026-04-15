const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true }, // Image/Video URL
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Automatically deleted after 24 hours
});

module.exports = mongoose.model('Story', StorySchema);
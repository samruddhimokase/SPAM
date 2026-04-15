const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['post', 'reel'], default: 'post' },
  imageUrl: { type: String, required: true }, // Existing DB field
  videoUrl: { type: String }, // For reels
  caption: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likeCount: { type: Number, default: 0 },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now },
    aiAnalysis: {
      isScam: { type: Boolean, default: false },
      riskScore: { type: Number, default: 0 },
      recommendation: { type: String, default: 'Safe' },
      classification: { type: String, default: 'Real' },
      confidence: { type: Number, default: 100 },
      flags: [{ type: String }]
    }
  }],
  riskAnalysis: {
    classification: { type: String, default: 'Real' },
    flags: [{ type: String }],
    score: { type: Number, default: 0 }
  },
  isFake: { type: Boolean, default: false },
  fakeConfidence: { type: Number, default: 0 },
  isSuspicious: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);
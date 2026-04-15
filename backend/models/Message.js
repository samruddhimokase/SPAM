const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, default: '' },
  mediaUrl: { type: String, default: '' },
  mediaType: { type: String, enum: ['image', 'video', 'document', 'voice', 'post', 'none'], default: 'none' },
  sharedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' },
  aiAnalysis: {
    isScam: { type: Boolean, default: false },
    riskScore: { type: Number, default: 0 },
    recommendation: { type: String, default: 'None' },
    classification: { type: String, default: 'Safe' },
    flags: [{ type: String }]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullName: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  bio: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  accountAge: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  riskScore: { type: Number, default: 0 },
  riskClassification: { type: String, default: 'Real' },
  riskFlags: [{ type: String }],
  loginHistory: [{
    ip: String,
    device: String,
    location: String,
    timestamp: { type: Date, default: Date.now },
    isSuspicious: { type: Boolean, default: false }
  }],
  lastLogin: {
    ip: String,
    device: String,
    location: String,
    timestamp: Date
  },
  loginAttempts: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
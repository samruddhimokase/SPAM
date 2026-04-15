const mongoose = require('mongoose');

const ReportedNumberSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  reports: [{
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    date: { type: Date, default: Date.now }
  }],
  riskScore: { type: Number, default: 0 },
  origin: { type: String, default: 'Unknown' },
  isProxy: { type: Boolean, default: false },
  totalReports: { type: Number, default: 0 }
});

module.exports = mongoose.model('ReportedNumber', ReportedNumberSchema);
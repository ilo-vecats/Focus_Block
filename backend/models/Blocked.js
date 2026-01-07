const mongoose = require('mongoose');

const BlockedSchema = new mongoose.Schema({
  url: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  schedule: {
    enabled: { type: Boolean, default: false },
    startTime: String, // e.g., "09:00"
    endTime: String,   // e.g., "17:00"
    days: [String]    // e.g., ["Monday", "Tuesday", "Wednesday"]
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Blocked', BlockedSchema);
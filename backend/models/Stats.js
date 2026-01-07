const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  blockedAttempts: { type: Number, default: 0 },
  focusTime: { type: Number, default: 0 }, // in minutes
  sitesBlocked: [String],
});

module.exports = mongoose.model('Stats', StatsSchema);


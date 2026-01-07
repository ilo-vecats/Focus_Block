const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { 
    type: String, 
    required: true,
    enum: [
      'CREATE_SESSION',
      'SCHEDULE_SESSION',
      'START_SESSION',
      'COMPLETE_SESSION',
      'CANCEL_SESSION',
      'ADD_BLOCKED_SITE',
      'REMOVE_BLOCKED_SITE',
      'UPDATE_BLOCKED_SITE',
      'LOGIN',
      'REGISTER'
    ]
  },
  resourceType: { type: String, enum: ['FocusSession', 'Blocked', 'User'], default: 'FocusSession' },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  oldState: { type: mongoose.Schema.Types.Mixed }, // Store previous state
  newState: { type: mongoose.Schema.Types.Mixed }, // Store new state
  metadata: { type: mongoose.Schema.Types.Mixed }, // Additional context
  timestamp: { type: Date, default: Date.now }
});

// Index for efficient queries
ActivityLogSchema.index({ user: 1, timestamp: -1 });
ActivityLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);


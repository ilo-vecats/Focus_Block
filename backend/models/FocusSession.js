const mongoose = require('mongoose');

const FocusSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  duration: { type: Number, required: true, min: 1 }, // in minutes
  status: {
    type: String,
    enum: ['CREATED', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
    default: 'CREATED'
  },
  scheduledStart: { type: Date }, // When session is scheduled to start
  actualStart: { type: Date }, // When session actually started
  actualEnd: { type: Date }, // When session ended
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// State transition validation method
FocusSessionSchema.methods.canTransitionTo = function(newStatus) {
  const validTransitions = {
    'CREATED': ['SCHEDULED', 'ACTIVE', 'CANCELLED'],
    'SCHEDULED': ['ACTIVE', 'CANCELLED'],
    'ACTIVE': ['COMPLETED', 'CANCELLED'],
    'COMPLETED': [], // Terminal state
    'CANCELLED': []  // Terminal state
  };

  return validTransitions[this.status]?.includes(newStatus) || false;
};

// Transition method with validation
FocusSessionSchema.methods.transitionTo = function(newStatus) {
  if (!this.canTransitionTo(newStatus)) {
    throw new Error(`Invalid transition from ${this.status} to ${newStatus}`);
  }
  
  const oldStatus = this.status;
  this.status = newStatus;
  this.updatedAt = new Date();
  
  // Set timestamps based on status
  if (newStatus === 'ACTIVE' && !this.actualStart) {
    this.actualStart = new Date();
  }
  if (newStatus === 'COMPLETED' && !this.actualEnd) {
    this.actualEnd = new Date();
  }
  
  return { oldStatus, newStatus };
};

module.exports = mongoose.model('FocusSession', FocusSessionSchema);


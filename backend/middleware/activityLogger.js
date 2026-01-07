const ActivityLog = require('../models/ActivityLog');

/**
 * Activity Logger Middleware
 * Logs user actions for audit trail
 */
const logActivity = async (req, res, next) => {
  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json to capture response
  res.json = function(data) {
    // Log activity after response is sent
    if (req.user && req.activityLog) {
      ActivityLog.create({
        user: req.user.id,
        action: req.activityLog.action,
        resourceType: req.activityLog.resourceType || 'FocusSession',
        resourceId: req.activityLog.resourceId,
        oldState: req.activityLog.oldState,
        newState: req.activityLog.newState,
        metadata: req.activityLog.metadata || {}
      }).catch(err => {
        console.error('Failed to log activity:', err);
        // Don't fail the request if logging fails
      });
    }
    return originalJson(data);
  };

  next();
};

module.exports = logActivity;


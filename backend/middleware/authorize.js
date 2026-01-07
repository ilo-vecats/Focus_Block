const { ForbiddenError } = require('./errorHandler');

/**
 * Role-based authorization middleware
 * Usage: authorize('ADMIN') or authorize(['USER', 'ADMIN'])
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError(`Access denied. Required role: ${allowedRoles.join(' or ')}`));
    }

    next();
  };
};

/**
 * Check if user owns resource or is admin
 */
const authorizeOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ForbiddenError('Authentication required'));
  }

  // Admin can access any resource
  if (req.user.role === 'ADMIN') {
    return next();
  }

  // User can only access their own resources
  if (req.user.id !== req.params.userId && req.user.id !== req.resource?.user?.toString()) {
    return next(new ForbiddenError('You can only access your own resources'));
  }

  next();
};

module.exports = { authorize, authorizeOwnerOrAdmin };


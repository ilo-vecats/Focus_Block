const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { authorize, authorizeOwnerOrAdmin } = require('../middleware/authorize');
const { 
  NotFoundError, 
  ValidationError, 
  ConflictError,
  ForbiddenError 
} = require('../middleware/errorHandler');
const FocusSession = require('../models/FocusSession');
const { paginate } = require('../utils/pagination');
const logActivity = require('../middleware/activityLogger');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Transform express-validator errors to match frontend expectations
    const formattedErrors = errors.array().map(err => ({
      field: err.param || err.path,
      message: err.msg
    }));
    return next(new ValidationError('Validation failed', formattedErrors));
  }
  next();
};

// GET /api/sessions - Get all sessions (with pagination and filtering)
router.get(
  '/',
  auth,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['CREATED', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
    query('userId').optional().isMongoId()
  ],
  validate,
  logActivity,
  async (req, res, next) => {
    try {
      const { page = 1, limit = 10, status, userId } = req.query;
      
      // Build query
      const query = {};
      
      // Non-admin users can only see their own sessions
      if (req.user.role !== 'ADMIN') {
        query.user = req.user.id;
      } else if (userId) {
        // Admin can filter by userId
        query.user = userId;
      }
      
      if (status) {
        query.status = status;
      }

      const result = await paginate(FocusSession, query, {
        page,
        limit,
        sort: { createdAt: -1 },
        select: '-__v'
      });

      // Populate user info
      await FocusSession.populate(result.data, { path: 'user', select: 'username email' });

      res.json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/sessions/:id - Get single session
router.get(
  '/:id',
  auth,
  [param('id').isMongoId()],
  validate,
  async (req, res, next) => {
    try {
      const session = await FocusSession.findById(req.params.id)
        .populate('user', 'username email');

      if (!session) {
        return next(new NotFoundError('FocusSession'));
      }

      // Check authorization
      if (req.user.role !== 'ADMIN' && session.user._id.toString() !== req.user.id) {
        return next(new ForbiddenError());
      }

      res.json({
        success: true,
        data: session
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/sessions - Create new session
router.post(
  '/',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim(),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute').toInt(),
    body('scheduledStart').optional({ checkFalsy: true, nullable: true })
  ],
  validate,
  logActivity,
  async (req, res, next) => {
    try {
      const { title, description, duration, scheduledStart } = req.body;
      console.log('Received session data:', { title, description, duration, scheduledStart, scheduledStartType: typeof scheduledStart });

      const sessionData = {
        user: req.user.id,
        title,
        description: description || '',
        duration,
        status: scheduledStart ? 'SCHEDULED' : 'CREATED'
      };

      // Validate and process scheduledStart if provided
      if (scheduledStart) {
        // Check if it's a valid non-empty string
        if (typeof scheduledStart !== 'string' || scheduledStart.trim() === '') {
          return next(new ValidationError('Scheduled start time cannot be empty'));
        }
        
        const scheduledDate = new Date(scheduledStart);
        if (isNaN(scheduledDate.getTime())) {
          return next(new ValidationError('Invalid date format for scheduled start'));
        }
        if (scheduledDate <= new Date()) {
          return next(new ValidationError('Scheduled start time must be in the future'));
        }
        sessionData.scheduledStart = scheduledDate;
      }

      const session = new FocusSession(sessionData);
      await session.save();

      // Log activity
      req.activityLog = {
        action: 'CREATE_SESSION',
        resourceId: session._id,
        newState: { status: session.status, title: session.title }
      };

      res.status(201).json({
        success: true,
        data: session
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/sessions/:id/start - Start a session (transition to ACTIVE)
router.put(
  '/:id/start',
  auth,
  [param('id').isMongoId()],
  validate,
  logActivity,
  async (req, res, next) => {
    try {
      const session = await FocusSession.findById(req.params.id);

      if (!session) {
        return next(new NotFoundError('FocusSession'));
      }

      // Check authorization
      if (req.user.role !== 'ADMIN' && session.user.toString() !== req.user.id) {
        return next(new ForbiddenError());
      }

      // Check if already active
      if (session.status === 'ACTIVE') {
        return next(new ConflictError('Session is already active'));
      }

      // Store old state for logging
      const oldState = { status: session.status };

      // Transition to ACTIVE
      const { oldStatus, newStatus } = session.transitionTo('ACTIVE');
      await session.save();

      // Log activity
      req.activityLog = {
        action: 'START_SESSION',
        resourceId: session._id,
        oldState,
        newState: { status: newStatus, actualStart: session.actualStart }
      };

      res.json({
        success: true,
        data: session,
        message: 'Session started successfully'
      });
    } catch (err) {
      if (err.message.includes('Invalid transition')) {
        return next(new ValidationError(err.message));
      }
      next(err);
    }
  }
);

// PUT /api/sessions/:id/complete - Complete a session (transition to COMPLETED)
router.put(
  '/:id/complete',
  auth,
  [param('id').isMongoId()],
  validate,
  logActivity,
  async (req, res, next) => {
    try {
      const session = await FocusSession.findById(req.params.id);

      if (!session) {
        return next(new NotFoundError('FocusSession'));
      }

      // Check authorization
      if (req.user.role !== 'ADMIN' && session.user.toString() !== req.user.id) {
        return next(new ForbiddenError());
      }

      // Store old state
      const oldState = { status: session.status };

      // Transition to COMPLETED
      const { oldStatus, newStatus } = session.transitionTo('COMPLETED');
      await session.save();

      // Log activity
      req.activityLog = {
        action: 'COMPLETE_SESSION',
        resourceId: session._id,
        oldState,
        newState: { status: newStatus, actualEnd: session.actualEnd }
      };

      res.json({
        success: true,
        data: session,
        message: 'Session completed successfully'
      });
    } catch (err) {
      if (err.message.includes('Invalid transition')) {
        return next(new ValidationError(err.message));
      }
      next(err);
    }
  }
);

// PUT /api/sessions/:id/cancel - Cancel a session (transition to CANCELLED)
router.put(
  '/:id/cancel',
  auth,
  [param('id').isMongoId()],
  validate,
  logActivity,
  async (req, res, next) => {
    try {
      const session = await FocusSession.findById(req.params.id);

      if (!session) {
        return next(new NotFoundError('FocusSession'));
      }

      // Check authorization
      if (req.user.role !== 'ADMIN' && session.user.toString() !== req.user.id) {
        return next(new ForbiddenError());
      }

      // Cannot cancel completed sessions
      if (session.status === 'COMPLETED') {
        return next(new ValidationError('Cannot cancel a completed session'));
      }

      // Store old state
      const oldState = { status: session.status };

      // Transition to CANCELLED
      const { oldStatus, newStatus } = session.transitionTo('CANCELLED');
      await session.save();

      // Log activity
      req.activityLog = {
        action: 'CANCEL_SESSION',
        resourceId: session._id,
        oldState,
        newState: { status: newStatus }
      };

      res.json({
        success: true,
        data: session,
        message: 'Session cancelled successfully'
      });
    } catch (err) {
      if (err.message.includes('Invalid transition')) {
        return next(new ValidationError(err.message));
      }
      next(err);
    }
  }
);

// PUT /api/sessions/:id/schedule - Schedule a session (transition to SCHEDULED)
router.put(
  '/:id/schedule',
  auth,
  [
    param('id').isMongoId(),
    body('scheduledStart').isISO8601().withMessage('Invalid date format')
  ],
  validate,
  logActivity,
  async (req, res, next) => {
    try {
      const session = await FocusSession.findById(req.params.id);

      if (!session) {
        return next(new NotFoundError('FocusSession'));
      }

      // Check authorization
      if (req.user.role !== 'ADMIN' && session.user.toString() !== req.user.id) {
        return next(new ForbiddenError());
      }

      const { scheduledStart } = req.body;
      const scheduledDate = new Date(scheduledStart);

      if (scheduledDate <= new Date()) {
        return next(new ValidationError('Scheduled start time must be in the future'));
      }

      // Store old state
      const oldState = { status: session.status, scheduledStart: session.scheduledStart };

      // Update scheduled time and transition if needed
      session.scheduledStart = scheduledDate;
      if (session.status === 'CREATED') {
        session.transitionTo('SCHEDULED');
      }
      await session.save();

      // Log activity
      req.activityLog = {
        action: 'SCHEDULE_SESSION',
        resourceId: session._id,
        oldState,
        newState: { status: session.status, scheduledStart: session.scheduledStart }
      };

      res.json({
        success: true,
        data: session,
        message: 'Session scheduled successfully'
      });
    } catch (err) {
      if (err.message.includes('Invalid transition')) {
        return next(new ValidationError(err.message));
      }
      next(err);
    }
  }
);

// DELETE /api/sessions/:id - Delete a session (only CREATED or CANCELLED)
router.delete(
  '/:id',
  auth,
  [param('id').isMongoId()],
  validate,
  async (req, res, next) => {
    try {
      const session = await FocusSession.findById(req.params.id);

      if (!session) {
        return next(new NotFoundError('FocusSession'));
      }

      // Check authorization
      if (req.user.role !== 'ADMIN' && session.user.toString() !== req.user.id) {
        return next(new ForbiddenError());
      }

      // Only allow deletion of CREATED or CANCELLED sessions
      if (!['CREATED', 'CANCELLED'].includes(session.status)) {
        return next(new ValidationError('Can only delete CREATED or CANCELLED sessions'));
      }

      await session.deleteOne();

      res.json({
        success: true,
        message: 'Session deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;


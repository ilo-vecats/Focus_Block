const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { ForbiddenError, NotFoundError, ValidationError } = require('../middleware/errorHandler');
const Blocked = require('../models/Blocked');
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

// Helper to normalize URL
const normalizeUrl = (url) => {
  let normalized = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  normalized = normalized.replace(/\/$/, '');
  return normalized;
};

// GET /api/blocked → get all blocked sites (with pagination)
router.get(
  '/',
  auth,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('isActive').optional().isBoolean().toBoolean()
  ],
  validate,
  async (req, res, next) => {
    try {
      const { page = 1, limit = 10, isActive } = req.query;

      // Build query - users can only see their own sites
      const query = { user: req.user.id };
      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      const result = await paginate(Blocked, query, {
        page,
        limit,
        sort: { createdAt: -1 }
      });

      res.json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/blocked → add a new blocked site
router.post(
  '/',
  auth,
  [
    body('url').trim().notEmpty().withMessage('URL is required'),
    body('schedule.enabled').optional().isBoolean(),
    body('schedule.startTime').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
    body('schedule.endTime').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
    body('schedule.days').optional().isArray(),
    body('schedule.days.*').optional().isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
  ],
  validate,
  logActivity,
  async (req, res, next) => {
    try {
      const { url, schedule } = req.body;

      // Normalize URL
      const normalizedUrl = normalizeUrl(url);

      // Check for duplicates
      const existing = await Blocked.findOne({ 
        user: req.user.id, 
        url: normalizedUrl 
      });
      if (existing) {
        return next(new ValidationError('This site is already blocked'));
      }

      const newSite = new Blocked({
        url: normalizedUrl,
        user: req.user.id,
        schedule: schedule || { enabled: false }
      });
      await newSite.save();

      // Log activity
      req.activityLog = {
        action: 'ADD_BLOCKED_SITE',
        resourceType: 'Blocked',
        resourceId: newSite._id,
        newState: { url: newSite.url, isActive: newSite.isActive }
      };

      res.status(201).json({
        success: true,
        data: newSite
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/blocked/:id → update a blocked site
router.put(
  '/:id',
  auth,
  [
    param('id').isMongoId(),
    body('schedule').optional().isObject(),
    body('isActive').optional().isBoolean()
  ],
  validate,
  logActivity,
  async (req, res, next) => {
    try {
      const site = await Blocked.findById(req.params.id);
      if (!site) {
        return next(new NotFoundError('Blocked site'));
      }

      if (site.user.toString() !== req.user.id && req.user.role !== 'ADMIN') {
        return next(new ForbiddenError());
      }

      // Store old state
      const oldState = {
        isActive: site.isActive,
        schedule: { ...site.schedule }
      };

      // Update fields
      if (req.body.schedule !== undefined) {
        site.schedule = { ...site.schedule, ...req.body.schedule };
      }
      if (req.body.isActive !== undefined) {
        site.isActive = req.body.isActive;
      }

      await site.save();

      // Log activity
      req.activityLog = {
        action: 'UPDATE_BLOCKED_SITE',
        resourceType: 'Blocked',
        resourceId: site._id,
        oldState,
        newState: {
          isActive: site.isActive,
          schedule: site.schedule
        }
      };

      res.json({
        success: true,
        data: site
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/blocked/:id → delete a blocked site
router.delete(
  '/:id',
  auth,
  [param('id').isMongoId()],
  validate,
  logActivity,
  async (req, res, next) => {
    try {
      const site = await Blocked.findById(req.params.id);
      if (!site) {
        return next(new NotFoundError('Blocked site'));
      }

      if (site.user.toString() !== req.user.id && req.user.role !== 'ADMIN') {
        return next(new ForbiddenError());
      }

      await site.deleteOne();

      // Log activity
      req.activityLog = {
        action: 'REMOVE_BLOCKED_SITE',
        resourceType: 'Blocked',
        resourceId: site._id,
        oldState: { url: site.url }
      };

      res.json({
        success: true,
        message: 'Site removed successfully'
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
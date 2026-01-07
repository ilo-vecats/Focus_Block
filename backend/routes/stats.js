const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const { validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { ValidationError } = require('../middleware/errorHandler');
const Stats = require('../models/Stats');

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

// GET /api/stats → get user statistics
router.get(
  '/',
  auth,
  [
    query('days').optional().isInt({ min: 1, max: 365 }).toInt()
  ],
  validate,
  async (req, res, next) => {
    try {
      const { days = 7 } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      startDate.setHours(0, 0, 0, 0);

      const stats = await Stats.find({
        user: req.user.id,
        date: { $gte: startDate }
      }).sort({ date: -1 });

      res.json({
        success: true,
        data: stats
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/stats/blocked → record a blocked attempt
router.post(
  '/blocked',
  auth,
  [
    body('url').trim().notEmpty().withMessage('URL is required')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { url } = req.body;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let stats = await Stats.findOne({
        user: req.user.id,
        date: today
      });

      if (!stats) {
        stats = new Stats({
          user: req.user.id,
          date: today,
          blockedAttempts: 1,
          sitesBlocked: [url]
        });
      } else {
        stats.blockedAttempts += 1;
        if (!stats.sitesBlocked.includes(url)) {
          stats.sitesBlocked.push(url);
        }
      }

      await stats.save();
      res.json({
        success: true,
        data: stats
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;


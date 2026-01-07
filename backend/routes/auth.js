const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { 
  ConflictError, 
  UnauthorizedError, 
  ValidationError 
} = require('../middleware/errorHandler');
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

// POST /api/auth/register
router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validate,
  logActivity,
  async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return next(new ConflictError('User already exists'));
      }

      // Create user
      user = new User({ username, email, password });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      // Log activity
      req.activityLog = {
        action: 'REGISTER',
        resourceType: 'User',
        resourceId: user._id,
        newState: { username: user.username, email: user.email, role: user.role }
      };

      res.status(201).json({
        success: true,
        message: 'User registered successfully'
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  logActivity,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return next(new UnauthorizedError('Invalid credentials'));
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return next(new UnauthorizedError('Invalid credentials'));
      }

      const payload = { 
        user: { 
          id: user.id, 
          username: user.username,
          role: user.role
        } 
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

      // Log activity
      req.activityLog = {
        action: 'LOGIN',
        resourceType: 'User',
        resourceId: user._id,
        metadata: { loginTime: new Date() }
      };

      res.json({
        success: true,
        token,
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/auth/users → list all users (admin only)
router.get(
  '/users',
  auth,
  authorize('ADMIN'),
  async (req, res, next) => {
    try {
      const users = await User.find().select('-password');
      res.json({
        success: true,
        data: users
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
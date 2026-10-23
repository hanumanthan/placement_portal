const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const {
  studentRegister,
  studentLogin,
  adminLogin,
  logout,
  getMe,
} = require('../controllers/auth.controller');

const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const AppError = require('../utils/AppError');

// Middleware to evaluate express-validator results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg).join(', ');
    return next(new AppError(errorMessages, 400));
  }
  next();
};

// ─── Student Registration Validation ──────────────────────────
const studentRegisterRules = [
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('register_number')
    .trim()
    .notEmpty()
    .withMessage('Register number is required')
    .isAlphanumeric()
    .withMessage('Register number must contain only letters and numbers'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9+ -]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
];

// ─── Student Login Validation ─────────────────────────────────
const studentLoginRules = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or Register number is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// ─── Admin Login Validation ───────────────────────────────────
const adminLoginRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Admin email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// ─── Auth Routes ──────────────────────────────────────────────
router.post('/student/register', authLimiter, studentRegisterRules, validate, studentRegister);
router.post('/student/login', authLimiter, studentLoginRules, validate, studentLogin);
router.post('/admin/login', authLimiter, adminLoginRules, validate, adminLogin);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;

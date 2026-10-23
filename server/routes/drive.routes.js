const express = require('express');
const router = express.Router();

const {
  getDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
  applyForDrive,
} = require('../controllers/drive.controller');

const { protect, restrictTo } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Optional auth reader middleware to identify student when fetching drives/details
const optionalAuth = (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.token && req.cookies.token !== 'loggedout') {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key_change_in_production_abc123xyz');
      req.user = { id: decoded.id };
      req.userRole = decoded.role;
    } catch (e) {
      // Ignore invalid token in optional auth
    }
  }
  next();
};

// Retrieve drives & single drive (with optional student context for eligibility)
router.get('/', optionalAuth, getDrives);
router.get('/:id', optionalAuth, getDriveById);

// Student Apply / "I'm Interested" action
router.post('/:id/apply', protect, restrictTo('student'), applyForDrive);

// Admin-only drive management
router.post('/', protect, restrictTo('admin'), createDrive);
router.put('/:id', protect, restrictTo('admin'), updateDrive);
router.delete('/:id', protect, restrictTo('admin'), deleteDrive);

module.exports = router;

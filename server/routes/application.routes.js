const express = require('express');
const router = express.Router();

const {
  getMyApplications,
  withdrawApplication,
  getAdminApplications,
  updateApplicationStatus,
  bulkUpdateApplicationStatus,
} = require('../controllers/application.controller');

const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

// Student routes
router.get('/my', restrictTo('student'), getMyApplications);
router.put('/:id/withdraw', restrictTo('student'), withdrawApplication);

// Admin routes
router.get('/', restrictTo('admin'), getAdminApplications);
router.put('/:id/status', restrictTo('admin'), updateApplicationStatus);
router.post('/bulk-status', restrictTo('admin'), bulkUpdateApplicationStatus);

module.exports = router;

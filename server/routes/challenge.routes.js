const express = require('express');
const router = express.Router();
const {
  getTodayChallenge,
  submitChallenge,
  getLeaderboard,
  getAllChallengesAdmin,
  createChallengeAdmin,
  deleteChallengeAdmin,
} = require('../controllers/challenge.controller');
const { protect, restrictTo } = require('../middleware/auth');

// Public/Common authenticated routes
router.get('/today', protect, getTodayChallenge);
router.get('/leaderboard', protect, getLeaderboard);

// Student only
router.post('/:id/submit', protect, restrictTo('student'), submitChallenge);

// Admin only
router.get('/admin/all', protect, restrictTo('admin'), getAllChallengesAdmin);
router.post('/admin', protect, restrictTo('admin'), createChallengeAdmin);
router.delete('/admin/:id', protect, restrictTo('admin'), deleteChallengeAdmin);

module.exports = router;

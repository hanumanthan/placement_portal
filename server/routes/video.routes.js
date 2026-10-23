const express = require('express');
const router = express.Router();
const {
  getVideos,
  getVideoById,
  getCategories,
  toggleProgress,
  createVideo,
  updateVideo,
  deleteVideo,
} = require('../controllers/video.controller');
const { protect, restrictTo } = require('../middleware/auth');

// All video routes require authentication
router.use(protect);

// Student & Admin: Browse videos & progress
router.get('/', getVideos);
router.get('/categories', getCategories);
router.get('/:id', getVideoById);
router.post('/:id/progress', toggleProgress);

// Admin only: CRUD
router.post('/', restrictTo('admin'), createVideo);
router.put('/:id', restrictTo('admin'), updateVideo);
router.delete('/:id', restrictTo('admin'), deleteVideo);

module.exports = router;

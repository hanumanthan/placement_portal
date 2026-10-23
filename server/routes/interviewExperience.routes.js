const express = require('express');
const router = express.Router();
const {
  getExperiences,
  getExperienceById,
  getFilterOptions,
  createExperience,
  updateExperience,
  deleteExperience,
} = require('../controllers/interviewExperience.controller');
const { protect, restrictTo } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Student & Admin: Browse experiences
router.get('/', getExperiences);
router.get('/filters', getFilterOptions);
router.get('/:id', getExperienceById);

// Admin only: CRUD
router.post('/', restrictTo('admin'), createExperience);
router.put('/:id', restrictTo('admin'), updateExperience);
router.delete('/:id', restrictTo('admin'), deleteExperience);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getQuestionById,
  getFilterOptions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/previousQuestion.controller');
const { protect, restrictTo } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Student & Admin: Browse questions
router.get('/', getQuestions);
router.get('/filters', getFilterOptions);
router.get('/:id', getQuestionById);

// Admin only: CRUD
router.post('/', restrictTo('admin'), createQuestion);
router.put('/:id', restrictTo('admin'), updateQuestion);
router.delete('/:id', restrictTo('admin'), deleteQuestion);

module.exports = router;

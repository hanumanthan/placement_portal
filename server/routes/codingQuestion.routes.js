const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getCategories,
  getQuestionById,
  runCode,
  submitCode,
  getSubmissions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllSubmissions,
} = require('../controllers/codingQuestion.controller');
const { protect, restrictTo } = require('../middleware/auth');

// All coding routes require authentication
router.use(protect);

// Student & Admin: Browse questions
router.get('/questions', getQuestions);
router.get('/categories', getCategories);
router.get('/questions/:id', getQuestionById);
router.post('/questions/:id/run', runCode);
router.post('/run', runCode);
router.post('/questions/:id/submit', restrictTo('student'), submitCode);
router.get('/questions/:id/submissions', restrictTo('student'), getSubmissions);

// Admin only: Manage questions & view all submissions
router.post('/questions', restrictTo('admin'), createQuestion);
router.put('/questions/:id', restrictTo('admin'), updateQuestion);
router.delete('/questions/:id', restrictTo('admin'), deleteQuestion);
router.get('/admin/submissions', restrictTo('admin'), getAllSubmissions);

module.exports = router;

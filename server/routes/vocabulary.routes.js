const express = require('express');
const router = express.Router();
const {
  getWordOfTheDay,
  getVocabularyList,
  updateStudentStatus,
  createVocabAdmin,
  updateVocabAdmin,
  deleteVocabAdmin,
} = require('../controllers/vocabulary.controller');
const { protect, restrictTo } = require('../middleware/auth');

// Public/Common authenticated routes
router.get('/', protect, getVocabularyList);
router.get('/today', protect, getWordOfTheDay);

// Student only status toggle
router.post('/:id/status', protect, restrictTo('student'), updateStudentStatus);

// Admin only CRUD
router.post('/admin', protect, restrictTo('admin'), createVocabAdmin);
router.put('/admin/:id', protect, restrictTo('admin'), updateVocabAdmin);
router.delete('/admin/:id', protect, restrictTo('admin'), deleteVocabAdmin);

module.exports = router;

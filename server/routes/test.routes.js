const express = require('express');
const router = express.Router();
const TestController = require('../controllers/test.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public/Common (Student or Admin authenticated)
router.get('/', authenticateToken, TestController.getAllTests);
router.get('/my-attempts', authenticateToken, requireRole('student'), TestController.getMyAttempts);
router.get('/:id', authenticateToken, TestController.getTestById);
router.get('/:id/stats', authenticateToken, TestController.getTestStats);
router.get('/attempts/:attemptId/result', authenticateToken, TestController.getAttemptResult);

// Student Test Actions
router.post('/:id/start', authenticateToken, requireRole('student'), TestController.startTest);
router.post('/attempts/:attemptId/submit', authenticateToken, requireRole('student'), TestController.submitTest);

// Admin Management
router.post('/', authenticateToken, requireRole('admin'), TestController.createTest);
router.put('/:id', authenticateToken, requireRole('admin'), TestController.updateTest);
router.delete('/:id', authenticateToken, requireRole('admin'), TestController.deleteTest);

// Admin Question Management
router.post('/:id/questions', authenticateToken, requireRole('admin'), TestController.addQuestion);
router.put('/questions/:questionId', authenticateToken, requireRole('admin'), TestController.updateQuestion);
router.delete('/questions/:questionId', authenticateToken, requireRole('admin'), TestController.deleteQuestion);

module.exports = router;

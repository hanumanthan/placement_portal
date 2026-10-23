const express = require('express');
const router = express.Router();

const {
  getAdminDashboard,
  getStudents,
  getStudentById,
  getReports,
} = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/students', getStudents);
router.get('/students/:id', getStudentById);
router.get('/reports', getReports);

module.exports = router;

const express = require('express');
const router = express.Router();

const {
  getStudentDashboard,
  getProfile,
  updateProfile,
  addSkill,
  deleteSkill,
  uploadResume,
  uploadPhoto,
} = require('../controllers/student.controller');

const { protect, restrictTo } = require('../middleware/auth');
const { uploadResume: multerResume, uploadPhoto: multerPhoto } = require('../config/multer');

// All routes here require authentication and student role
router.use(protect);
router.use(restrictTo('student'));

router.get('/dashboard', getStudentDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/skills', addSkill);
router.delete('/skills/:id', deleteSkill);
router.post('/resume', multerResume.single('resume'), uploadResume);
router.post('/photo', multerPhoto.single('photo'), uploadPhoto);

module.exports = router;

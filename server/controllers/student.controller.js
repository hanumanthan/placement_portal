const StudentModel = require('../models/student.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');

/**
 * @desc    Get aggregated student dashboard data
 * @route   GET /api/dashboard/student
 * @access  Private (Student)
 */
const getStudentDashboard = catchAsync(async (req, res, next) => {
  const studentId = req.user.id;
  const dashboardData = await StudentModel.getStudentDashboard(studentId);

  if (!dashboardData) {
    return next(new AppError('Student profile not found.', 404));
  }

  sendSuccess(res, dashboardData, 'Student dashboard retrieved successfully');
});

/**
 * @desc    Get student profile details
 * @route   GET /api/students/profile
 * @access  Private (Student)
 */
const getProfile = catchAsync(async (req, res, next) => {
  const studentId = req.user.id;
  const profile = await StudentModel.getStudentProfile(studentId);

  if (!profile) {
    return next(new AppError('Student profile not found.', 404));
  }

  sendSuccess(res, profile, 'Profile retrieved successfully');
});

/**
 * @desc    Update student profile details
 * @route   PUT /api/students/profile
 * @access  Private (Student)
 */
const updateProfile = catchAsync(async (req, res, next) => {
  const studentId = req.user.id;
  const {
    full_name,
    phone,
    cgpa,
    tenth_percentage,
    twelfth_percentage,
    diploma_percentage,
    standing_arrears,
    history_arrears,
    github_url,
    linkedin_url,
    portfolio_url,
    bio,
  } = req.body;

  await StudentModel.updateStudentProfile(studentId, {
    full_name,
    phone,
    cgpa: cgpa !== undefined ? parseFloat(cgpa) : undefined,
    tenth_percentage: tenth_percentage !== undefined ? parseFloat(tenth_percentage) : undefined,
    twelfth_percentage: twelfth_percentage !== undefined ? parseFloat(twelfth_percentage) : undefined,
    diploma_percentage: diploma_percentage ? parseFloat(diploma_percentage) : null,
    standing_arrears: standing_arrears !== undefined ? parseInt(standing_arrears, 10) : undefined,
    history_arrears: history_arrears !== undefined ? parseInt(history_arrears, 10) : undefined,
    github_url,
    linkedin_url,
    portfolio_url,
    bio,
  });

  const updatedProfile = await StudentModel.getStudentProfile(studentId);
  sendSuccess(res, updatedProfile, 'Profile updated successfully');
});

/**
 * @desc    Add a student skill
 * @route   POST /api/students/skills
 * @access  Private (Student)
 */
const addSkill = catchAsync(async (req, res, next) => {
  const studentId = req.user.id;
  const { skill_name, proficiency } = req.body;

  if (!skill_name || !skill_name.trim()) {
    return next(new AppError('Skill name is required.', 400));
  }

  await StudentModel.addSkill(studentId, skill_name, proficiency || 'intermediate');
  const updatedProfile = await StudentModel.getStudentProfile(studentId);

  sendSuccess(res, updatedProfile.skills, 'Skill added successfully');
});

/**
 * @desc    Delete a student skill
 * @route   DELETE /api/students/skills/:id
 * @access  Private (Student)
 */
const deleteSkill = catchAsync(async (req, res, next) => {
  const studentId = req.user.id;
  const skillId = req.params.id;

  const deleted = await StudentModel.deleteSkill(studentId, skillId);
  if (!deleted) {
    return next(new AppError('Skill not found or already removed.', 404));
  }

  const updatedProfile = await StudentModel.getStudentProfile(studentId);
  sendSuccess(res, updatedProfile.skills, 'Skill removed successfully');
});

/**
 * @desc    Upload Resume PDF
 * @route   POST /api/students/resume
 * @access  Private (Student)
 */
const uploadResume = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please select a PDF resume file to upload.', 400));
  }

  const studentId = req.user.id;
  const fileUrl = `/uploads/resumes/${req.file.filename}`;

  await StudentModel.updateResume(studentId, fileUrl);

  sendSuccess(res, { resume_url: fileUrl }, 'Resume uploaded successfully');
});

/**
 * @desc    Upload Profile Photo
 * @route   POST /api/students/photo
 * @access  Private (Student)
 */
const uploadPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please select an image file to upload.', 400));
  }

  const studentId = req.user.id;
  const fileUrl = `/uploads/photos/${req.file.filename}`;

  await StudentModel.updatePhoto(studentId, fileUrl);

  sendSuccess(res, { photo_url: fileUrl }, 'Photo uploaded successfully');
});

module.exports = {
  getStudentDashboard,
  getProfile,
  updateProfile,
  addSkill,
  deleteSkill,
  uploadResume,
  uploadPhoto,
};

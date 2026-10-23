const AdminModel = require('../models/admin.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');

/**
 * @desc    Get aggregated admin dashboard metrics & charts
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 */
const getAdminDashboard = catchAsync(async (req, res, next) => {
  const dashboardStats = await AdminModel.getAdminDashboardStats();
  sendSuccess(res, dashboardStats, 'Admin dashboard metrics retrieved successfully');
});

/**
 * @desc    Get paginated students list with department and batch filters
 * @route   GET /api/admin/students
 * @access  Private (Admin)
 */
const getStudents = catchAsync(async (req, res, next) => {
  const { search, department, batch, status, page = 1, limit = 15 } = req.query;
  const result = await AdminModel.getStudents({
    search,
    department,
    batch,
    status,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  });
  sendSuccess(res, result, 'Students list retrieved successfully');
});

/**
 * @desc    Get comprehensive student detail with profile and applications
 * @route   GET /api/admin/students/:id
 * @access  Private (Admin)
 */
const getStudentById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const student = await AdminModel.getStudentById(id);
  if (!student) {
    throw new AppError('Student not found', 404);
  }
  sendSuccess(res, student, 'Student details retrieved successfully');
});

/**
 * @desc    Get placement reports, package distribution, and department analytics
 * @route   GET /api/admin/reports
 * @access  Private (Admin)
 */
const getReports = catchAsync(async (req, res, next) => {
  const reports = await AdminModel.getReportsData();
  sendSuccess(res, reports, 'Placement reports retrieved successfully');
});

module.exports = {
  getAdminDashboard,
  getStudents,
  getStudentById,
  getReports,
};

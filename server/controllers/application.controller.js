const ApplicationModel = require('../models/application.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendPaginated } = require('../utils/response');

/**
 * @desc    Get all applications for logged-in student
 * @route   GET /api/applications/my
 * @access  Private (Student)
 */
const getMyApplications = catchAsync(async (req, res) => {
  const studentId = req.user.id;
  const { status } = req.query;

  const applications = await ApplicationModel.findByStudent(studentId, { status });
  sendSuccess(res, applications, 'Applications retrieved successfully');
});

/**
 * @desc    Withdraw application
 * @route   PUT /api/applications/:id/withdraw
 * @access  Private (Student)
 */
const withdrawApplication = catchAsync(async (req, res, next) => {
  const applicationId = req.params.id;
  const studentId = req.user.id;

  const success = await ApplicationModel.withdraw(applicationId, studentId);
  if (!success) {
    return next(new AppError('Application not found or already withdrawn.', 404));
  }

  sendSuccess(res, null, 'Application withdrawn successfully');
});

/**
 * @desc    Admin: Get all student applications with filters
 * @route   GET /api/applications
 * @access  Private (Admin)
 */
const getAdminApplications = catchAsync(async (req, res) => {
  const { search, company_id, drive_id, status, department, page, limit } = req.query;

  const result = await ApplicationModel.findAll({
    search,
    company_id,
    drive_id,
    status,
    department,
    page,
    limit,
  });

  sendPaginated(res, result.applications, result.pagination, 'Applications retrieved successfully');
});

/**
 * @desc    Admin: Update single application status
 * @route   PUT /api/applications/:id/status
 * @access  Private (Admin)
 */
const updateApplicationStatus = catchAsync(async (req, res, next) => {
  const applicationId = req.params.id;
  const { status, notes } = req.body;

  if (!status) {
    return next(new AppError('Status is required.', 400));
  }

  const success = await ApplicationModel.updateStatus(applicationId, { status, notes });
  if (!success) {
    return next(new AppError('Application not found.', 404));
  }

  sendSuccess(res, null, `Application status updated to "${status}" and student notified.`);
});

/**
 * @desc    Admin: Bulk update application statuses
 * @route   POST /api/applications/bulk-status
 * @access  Private (Admin)
 */
const bulkUpdateApplicationStatus = catchAsync(async (req, res, next) => {
  const { applicationIds, status, notes } = req.body;

  if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0 || !status) {
    return next(new AppError('Please provide application IDs and target status.', 400));
  }

  const updatedCount = await ApplicationModel.bulkUpdateStatus({ applicationIds, status, notes });
  sendSuccess(res, { updated_count: updatedCount }, `Successfully updated ${updatedCount} applications to "${status}".`);
});

module.exports = {
  getMyApplications,
  withdrawApplication,
  getAdminApplications,
  updateApplicationStatus,
  bulkUpdateApplicationStatus,
};

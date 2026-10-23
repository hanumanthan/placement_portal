const DriveModel = require('../models/drive.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');

/**
 * @desc    Get all placement drives with search and multi-criteria filters
 * @route   GET /api/drives
 * @access  Public / Private
 */
const getDrives = catchAsync(async (req, res) => {
  const {
    search,
    department,
    employment_type,
    status,
    min_package,
    max_package,
    page,
    limit,
  } = req.query;

  // If student is logged in, attach student_id for application status tracking
  const studentId = req.user && req.userRole === 'student' ? req.user.id : null;

  const result = await DriveModel.findAll({
    search,
    department,
    employment_type,
    status,
    min_package: min_package ? parseFloat(min_package) : 0,
    max_package: max_package ? parseFloat(max_package) : 100,
    student_id: studentId,
    page,
    limit,
  });

  sendPaginated(res, result.drives, result.pagination, 'Placement drives retrieved successfully');
});

/**
 * @desc    Get single drive with selection rounds and eligibility check
 * @route   GET /api/drives/:id
 * @access  Public / Private
 */
const getDriveById = catchAsync(async (req, res, next) => {
  const studentId = req.user && req.userRole === 'student' ? req.user.id : null;
  const drive = await DriveModel.findById(req.params.id, studentId);

  if (!drive) {
    return next(new AppError('Placement drive not found.', 404));
  }

  sendSuccess(res, drive, 'Placement drive details retrieved successfully');
});

/**
 * @desc    Create a new placement drive with selection rounds
 * @route   POST /api/drives
 * @access  Private (Admin)
 */
const createDrive = catchAsync(async (req, res, next) => {
  const {
    company_id,
    job_title,
    job_description,
    location,
    employment_type,
    package_lpa,
    stipend_monthly,
    drive_date,
    application_deadline,
    eligible_departments,
    min_cgpa,
    min_tenth_percentage,
    min_twelfth_percentage,
    max_standing_arrears,
    max_history_arrears,
    required_skills,
    official_apply_link,
    instructions,
    status,
    rounds,
  } = req.body;

  if (!company_id || !job_title || !job_description || !location || !drive_date || !application_deadline || !eligible_departments) {
    return next(new AppError('Please provide all mandatory drive details.', 400));
  }

  const driveId = await DriveModel.create(
    {
      company_id,
      job_title,
      job_description,
      location,
      employment_type,
      package_lpa,
      stipend_monthly,
      drive_date,
      application_deadline,
      eligible_departments,
      min_cgpa,
      min_tenth_percentage,
      min_twelfth_percentage,
      max_standing_arrears,
      max_history_arrears,
      required_skills,
      official_apply_link,
      instructions,
      status,
    },
    rounds
  );

  const newDrive = await DriveModel.findById(driveId);
  sendCreated(res, newDrive, 'Placement drive created successfully');
});

/**
 * @desc    Update an existing placement drive
 * @route   PUT /api/drives/:id
 * @access  Private (Admin)
 */
const updateDrive = catchAsync(async (req, res, next) => {
  const driveId = req.params.id;
  const { rounds, ...driveData } = req.body;

  const updated = await DriveModel.update(driveId, driveData, rounds);
  if (!updated) {
    return next(new AppError('Drive not found or update failed.', 404));
  }

  const updatedDrive = await DriveModel.findById(driveId);
  sendSuccess(res, updatedDrive, 'Placement drive updated successfully');
});

/**
 * @desc    Delete a placement drive
 * @route   DELETE /api/drives/:id
 * @access  Private (Admin)
 */
const deleteDrive = catchAsync(async (req, res, next) => {
  const deleted = await DriveModel.delete(req.params.id);
  if (!deleted) {
    return next(new AppError('Placement drive not found.', 404));
  }
  sendSuccess(res, null, 'Placement drive deleted successfully');
});

/**
 * @desc    Student Apply / Express Interest in Drive
 * @route   POST /api/drives/:id/apply
 * @access  Private (Student)
 */
const applyForDrive = catchAsync(async (req, res, next) => {
  const driveId = req.params.id;
  const studentId = req.user.id;
  const { status = 'Interested', notes } = req.body;

  try {
    await DriveModel.applyForDrive(driveId, studentId, status, notes);
    const updatedDrive = await DriveModel.findById(driveId, studentId);
    sendSuccess(res, updatedDrive, `Application status updated to "${status}" successfully`);
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
});

module.exports = {
  getDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
  applyForDrive,
};

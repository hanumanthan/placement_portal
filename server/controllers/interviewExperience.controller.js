const InterviewExperienceModel = require('../models/interviewExperience.model');
const { sendSuccess, sendCreated } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Get interview experiences list with filters + pagination
 */
const getExperiences = catchAsync(async (req, res, next) => {
  const { company_id, verdict, difficulty, search, page = 1, limit = 10 } = req.query;

  const data = await InterviewExperienceModel.findAll({
    company_id,
    verdict,
    difficulty,
    search,
    page,
    limit,
  });

  sendSuccess(res, data, 'Interview experiences retrieved successfully');
});

/**
 * Get single experience by ID
 */
const getExperienceById = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const experience = await InterviewExperienceModel.findById(id);

  if (!experience) {
    return next(new AppError('Interview experience not found.', 404));
  }

  sendSuccess(res, experience, 'Experience retrieved successfully');
});

/**
 * Get filter options (companies with experiences)
 */
const getFilterOptions = catchAsync(async (req, res, next) => {
  const options = await InterviewExperienceModel.getFilterOptions();
  sendSuccess(res, options, 'Filter options retrieved');
});

/**
 * Admin: Create experience
 */
const createExperience = catchAsync(async (req, res, next) => {
  const { company_id, author_name, role_title, content } = req.body;

  if (!company_id || !author_name || !role_title || !content) {
    return next(new AppError('Company, author, role, and content are required.', 400));
  }

  const id = await InterviewExperienceModel.create(req.body);
  sendCreated(res, { id }, 'Interview experience created successfully');
});

/**
 * Admin: Update experience
 */
const updateExperience = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const updated = await InterviewExperienceModel.update(id, req.body);

  if (!updated) {
    return next(new AppError('Experience not found.', 404));
  }

  sendSuccess(res, null, 'Experience updated successfully');
});

/**
 * Admin: Delete experience
 */
const deleteExperience = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const deleted = await InterviewExperienceModel.delete(id);

  if (!deleted) {
    return next(new AppError('Experience not found.', 404));
  }

  sendSuccess(res, null, 'Experience deleted successfully');
});

module.exports = {
  getExperiences,
  getExperienceById,
  getFilterOptions,
  createExperience,
  updateExperience,
  deleteExperience,
};

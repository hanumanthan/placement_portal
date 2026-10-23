const VideoModel = require('../models/video.model');
const { sendSuccess, sendCreated } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Get videos list with filters and watch progress
 */
exports.getVideos = catchAsync(async (req, res) => {
  const { category, difficulty, search, page = 1, limit = 12 } = req.query;
  const student_id = req.user?.role === 'student' ? req.user.id : null;

  const result = await VideoModel.findAll({
    category,
    difficulty,
    search,
    student_id,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  });

  return sendSuccess(res, result, 'Videos retrieved successfully');
});

/**
 * Get video categories
 */
exports.getCategories = catchAsync(async (req, res) => {
  const categories = await VideoModel.getCategories();
  return sendSuccess(res, categories, 'Video categories retrieved successfully');
});

/**
 * Get single video by ID
 */
exports.getVideoById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const student_id = req.user?.role === 'student' ? req.user.id : null;

  const video = await VideoModel.findById(id, student_id);
  if (!video) {
    throw new AppError('Video not found', 404);
  }

  return sendSuccess(res, video, 'Video retrieved successfully');
});

/**
 * Toggle watched/completed status for a student
 */
exports.toggleProgress = catchAsync(async (req, res) => {
  const { id } = req.params;
  const student_id = req.user.id;

  const video = await VideoModel.findById(id);
  if (!video) {
    throw new AppError('Video not found', 404);
  }

  const result = await VideoModel.toggleProgress(student_id, id);
  return sendSuccess(res, result, 'Video watch progress updated');
});

/**
 * Admin: Create video
 */
exports.createVideo = catchAsync(async (req, res) => {
  const { title, description, category, difficulty, youtube_url, duration } = req.body;

  if (!title || !youtube_url) {
    throw new AppError('Title and YouTube URL are required', 400);
  }

  const id = await VideoModel.create({
    title,
    description,
    category,
    difficulty,
    youtube_url,
    duration,
  });

  return sendCreated(res, { id }, 'Video created successfully');
});

/**
 * Admin: Update video
 */
exports.updateVideo = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, description, category, difficulty, youtube_url, duration } = req.body;

  if (!title || !youtube_url) {
    throw new AppError('Title and YouTube URL are required', 400);
  }

  const updated = await VideoModel.update(id, {
    title,
    description,
    category,
    difficulty,
    youtube_url,
    duration,
  });

  if (!updated) {
    throw new AppError('Video not found or no changes made', 404);
  }

  return sendSuccess(res, null, 'Video updated successfully');
});

/**
 * Admin: Delete video
 */
exports.deleteVideo = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deleted = await VideoModel.delete(id);

  if (!deleted) {
    throw new AppError('Video not found', 404);
  }

  return sendSuccess(res, null, 'Video deleted successfully');
});

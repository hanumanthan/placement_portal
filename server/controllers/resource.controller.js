const ResourceModel = require('../models/resource.model');
const { sendSuccess, sendCreated } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Get resources list with filters
 */
exports.getResources = catchAsync(async (req, res) => {
  const { category, file_type, search, page = 1, limit = 12 } = req.query;

  const result = await ResourceModel.findAll({
    category,
    file_type,
    search,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  });

  return sendSuccess(res, result, 'Resources retrieved successfully');
});

/**
 * Get resource categories
 */
exports.getCategories = catchAsync(async (req, res) => {
  const categories = await ResourceModel.getCategories();
  return sendSuccess(res, categories, 'Resource categories retrieved successfully');
});

/**
 * Get single resource by ID
 */
exports.getResourceById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const resource = await ResourceModel.findById(id);

  if (!resource) {
    throw new AppError('Resource not found', 404);
  }

  return sendSuccess(res, resource, 'Resource retrieved successfully');
});

/**
 * Admin: Create resource
 */
exports.createResource = catchAsync(async (req, res) => {
  const { title, category, file_url, file_type, description } = req.body;

  if (!title || !file_url) {
    throw new AppError('Title and file URL are required', 400);
  }

  const id = await ResourceModel.create({
    title,
    category,
    file_url,
    file_type,
    description,
  });

  return sendCreated(res, { id }, 'Resource created successfully');
});

/**
 * Admin: Update resource
 */
exports.updateResource = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, category, file_url, file_type, description } = req.body;

  if (!title || !file_url) {
    throw new AppError('Title and file URL are required', 400);
  }

  const updated = await ResourceModel.update(id, {
    title,
    category,
    file_url,
    file_type,
    description,
  });

  if (!updated) {
    throw new AppError('Resource not found or no changes made', 404);
  }

  return sendSuccess(res, null, 'Resource updated successfully');
});

/**
 * Admin: Delete resource
 */
exports.deleteResource = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deleted = await ResourceModel.delete(id);

  if (!deleted) {
    throw new AppError('Resource not found', 404);
  }

  return sendSuccess(res, null, 'Resource deleted successfully');
});

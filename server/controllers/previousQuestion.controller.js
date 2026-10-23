const PreviousQuestionModel = require('../models/previousQuestion.model');
const { sendSuccess, sendCreated } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Get previous questions list with filters + pagination
 */
const getQuestions = catchAsync(async (req, res, next) => {
  const { company_id, year, category, difficulty, search, page = 1, limit = 20 } = req.query;

  const data = await PreviousQuestionModel.findAll({
    company_id,
    year,
    category,
    difficulty,
    search,
    page,
    limit,
  });

  sendSuccess(res, data, 'Previous questions retrieved successfully');
});

/**
 * Get single question by ID (with answer & explanation for practice reveal)
 */
const getQuestionById = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const question = await PreviousQuestionModel.findById(id);

  if (!question) {
    return next(new AppError('Question not found.', 404));
  }

  sendSuccess(res, question, 'Question retrieved successfully');
});

/**
 * Get filter dropdown options (companies, years, categories)
 */
const getFilterOptions = catchAsync(async (req, res, next) => {
  const options = await PreviousQuestionModel.getFilterOptions();
  sendSuccess(res, options, 'Filter options retrieved');
});

/**
 * Admin: Create question
 */
const createQuestion = catchAsync(async (req, res, next) => {
  const { company_id, year, category, difficulty, question_text, options, correct_answer, explanation } = req.body;

  if (!company_id || !year || !category || !question_text) {
    return next(new AppError('Company, year, category, and question text are required.', 400));
  }

  const id = await PreviousQuestionModel.create({
    company_id,
    year,
    category,
    difficulty,
    question_text,
    options,
    correct_answer,
    explanation,
  });

  sendCreated(res, { id }, 'Previous question created successfully');
});

/**
 * Admin: Update question
 */
const updateQuestion = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const updated = await PreviousQuestionModel.update(id, req.body);

  if (!updated) {
    return next(new AppError('Question not found.', 404));
  }

  sendSuccess(res, null, 'Question updated successfully');
});

/**
 * Admin: Delete question
 */
const deleteQuestion = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const deleted = await PreviousQuestionModel.delete(id);

  if (!deleted) {
    return next(new AppError('Question not found.', 404));
  }

  sendSuccess(res, null, 'Question deleted successfully');
});

module.exports = {
  getQuestions,
  getQuestionById,
  getFilterOptions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};

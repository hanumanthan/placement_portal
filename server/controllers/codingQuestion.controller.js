const CodingQuestionModel = require('../models/codingQuestion.model');
const CompilerService = require('../services/compiler.service');
const { sendSuccess, sendCreated } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Get coding questions catalog
 */
exports.getQuestions = catchAsync(async (req, res) => {
  const { difficulty, category, search, page = 1, limit = 20 } = req.query;
  const student_id = req.user?.role === 'student' ? req.user.id : null;

  const result = await CodingQuestionModel.findAll({
    difficulty,
    category,
    search,
    student_id,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  });

  return sendSuccess(res, result, 'Coding questions retrieved successfully');
});

/**
 * Get coding categories
 */
exports.getCategories = catchAsync(async (req, res) => {
  const categories = await CodingQuestionModel.getCategories();
  return sendSuccess(res, categories, 'Categories retrieved successfully');
});

/**
 * Get single coding question details
 */
exports.getQuestionById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const question = await CodingQuestionModel.findById(id);

  if (!question) {
    throw new AppError('Coding question not found', 404);
  }

  // If student, sanitize test cases so hidden cases are not revealed
  let visibleTestCases = question.test_cases;
  if (req.user?.role === 'student' && Array.isArray(question.test_cases)) {
    visibleTestCases = question.test_cases.filter((tc) => !tc.is_hidden);
  }

  return sendSuccess(res, {
    ...question,
    test_cases: visibleTestCases,
  }, 'Question details retrieved successfully');
});

/**
 * Run code against custom stdin input (Preview Compiler)
 */
exports.runCode = catchAsync(async (req, res) => {
  const { language, source_code, input } = req.body;

  if (!language || !source_code) {
    throw new AppError('Language and source code are required', 400);
  }

  const lang = language.toLowerCase().trim();
  if (lang !== 'c' && lang !== 'java') {
    throw new AppError('Only C and Java compilers are supported', 400);
  }

  const result = await CompilerService.execute(lang, source_code, input || '', 4000);
  return sendSuccess(res, result, 'Code executed successfully');
});

/**
 * Submit code for automated evaluation against all hidden & sample test cases
 */
exports.submitCode = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { language, source_code } = req.body;
  const student_id = req.user.id;

  if (!language || !source_code) {
    throw new AppError('Language and source code are required', 400);
  }

  const lang = language.toLowerCase().trim();
  if (lang !== 'c' && lang !== 'java') {
    throw new AppError('Only C and Java compilers are supported', 400);
  }

  const question = await CodingQuestionModel.findById(id);
  if (!question) {
    throw new AppError('Coding question not found', 404);
  }

  const testCases = Array.isArray(question.test_cases) ? question.test_cases : [];
  if (testCases.length === 0) {
    throw new AppError('No test cases configured for this question', 400);
  }

  // Run full evaluation
  const evaluation = await CompilerService.evaluateTestCases(
    lang,
    source_code,
    testCases,
    question.time_limit || 3000
  );

  // Save submission record
  const submissionId = await CodingQuestionModel.saveSubmission({
    question_id: id,
    student_id,
    language: lang,
    source_code,
    status: evaluation.status,
    passed_test_cases: evaluation.passedCount,
    total_test_cases: evaluation.totalCount,
    execution_time_ms: evaluation.executionTime,
    error_message: evaluation.errorMessage,
  });

  return sendSuccess(res, {
    submissionId,
    ...evaluation,
  }, 'Solution evaluated successfully');
});

/**
 * Get student's previous submissions for a question
 */
exports.getSubmissions = catchAsync(async (req, res) => {
  const { id } = req.params;
  const student_id = req.user.id;

  const submissions = await CodingQuestionModel.getSubmissions(id, student_id);
  return sendSuccess(res, submissions, 'Submissions history retrieved');
});

/**
 * Admin: Create a new coding question
 */
exports.createQuestion = catchAsync(async (req, res) => {
  const {
    title,
    difficulty,
    category,
    description,
    input_format,
    output_format,
    constraints,
    sample_input,
    sample_output,
    explanation,
    test_cases,
    starter_c,
    starter_java,
    time_limit,
    points,
  } = req.body;

  if (!title || !description) {
    throw new AppError('Title and description are required', 400);
  }

  const id = await CodingQuestionModel.create({
    title,
    difficulty,
    category,
    description,
    input_format,
    output_format,
    constraints,
    sample_input,
    sample_output,
    explanation,
    test_cases,
    starter_c,
    starter_java,
    time_limit,
    points,
  });

  return sendCreated(res, { id }, 'Coding question created successfully');
});

/**
 * Admin: Update coding question
 */
exports.updateQuestion = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updated = await CodingQuestionModel.update(id, req.body);

  if (!updated) {
    throw new AppError('Question not found or no changes made', 404);
  }

  return sendSuccess(res, null, 'Coding question updated successfully');
});

/**
 * Admin: Delete coding question
 */
exports.deleteQuestion = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deleted = await CodingQuestionModel.delete(id);

  if (!deleted) {
    throw new AppError('Question not found', 404);
  }

  return sendSuccess(res, null, 'Coding question deleted successfully');
});

/**
 * Admin: Get all student coding submissions
 */
exports.getAllSubmissions = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await CodingQuestionModel.getAllSubmissions({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  });

  return sendSuccess(res, result, 'All submissions retrieved successfully');
});

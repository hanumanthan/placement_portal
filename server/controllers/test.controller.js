const TestModel = require('../models/test.model');
const { successResponse, errorResponse } = require('../utils/response');

class TestController {
  /**
   * Get all tests
   */
  static async getAllTests(req, res, next) {
    try {
      const isStudent = req.user?.role === 'student';
      const studentId = isStudent ? req.user.id : null;
      const { category, difficulty, search } = req.query;

      const filters = {
        is_published: isStudent ? true : req.query.is_published !== undefined ? req.query.is_published === 'true' : undefined,
        category,
        difficulty,
        search,
        studentId,
      };

      const tests = await TestModel.findAll(filters);
      return successResponse(res, tests, 'Tests retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single test details
   */
  static async getTestById(req, res, next) {
    try {
      const { id } = req.params;
      const isAdmin = req.user?.role === 'admin';
      const test = await TestModel.findById(id, { includeAnswers: isAdmin });

      if (!test) {
        return errorResponse(res, 'Test not found', 404);
      }

      return successResponse(res, test, 'Test details retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Create test (Admin)
   */
  static async createTest(req, res, next) {
    try {
      const testId = await TestModel.create(req.body);
      const newTest = await TestModel.findById(testId, { includeAnswers: true });
      return successResponse(res, newTest, 'Test created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update test (Admin)
   */
  static async updateTest(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await TestModel.update(id, req.body);
      if (!updated) {
        return errorResponse(res, 'Test not found or no changes made', 404);
      }
      const test = await TestModel.findById(id, { includeAnswers: true });
      return successResponse(res, test, 'Test updated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete test (Admin)
   */
  static async deleteTest(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await TestModel.delete(id);
      if (!deleted) {
        return errorResponse(res, 'Test not found', 404);
      }
      return successResponse(res, null, 'Test deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Add question to test (Admin)
   */
  static async addQuestion(req, res, next) {
    try {
      const { id } = req.params;
      const questionId = await TestModel.addQuestion(id, req.body);
      return successResponse(res, { id: questionId }, 'Question added successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update question (Admin)
   */
  static async updateQuestion(req, res, next) {
    try {
      const { questionId } = req.params;
      const updated = await TestModel.updateQuestion(questionId, req.body);
      if (!updated) {
        return errorResponse(res, 'Question not found', 404);
      }
      return successResponse(res, null, 'Question updated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete question (Admin)
   */
  static async deleteQuestion(req, res, next) {
    try {
      const { questionId } = req.params;
      const deleted = await TestModel.deleteQuestion(questionId);
      if (!deleted) {
        return errorResponse(res, 'Question not found', 404);
      }
      return successResponse(res, null, 'Question deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Start or resume test attempt (Student)
   */
  static async startTest(req, res, next) {
    try {
      const { id } = req.params;
      const studentId = req.user.id;
      const attemptData = await TestModel.startAttempt(id, studentId);
      const test = await TestModel.findById(id, { includeAnswers: false });

      return successResponse(
        res,
        {
          attempt: attemptData,
          test,
        },
        attemptData.resumed ? 'Test attempt resumed' : 'Test started successfully'
      );
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  }

  /**
   * Submit test attempt (Student)
   */
  static async submitTest(req, res, next) {
    try {
      const { attemptId } = req.params;
      const studentId = req.user.id;
      const { answers } = req.body;

      const result = await TestModel.submitAttempt(attemptId, studentId, answers);
      return successResponse(res, result, 'Test submitted successfully');
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  }

  /**
   * Get full scorecard and answer review
   */
  static async getAttemptResult(req, res, next) {
    try {
      const { attemptId } = req.params;
      const isAdmin = req.user.role === 'admin';
      const studentId = req.user.id;

      const result = await TestModel.getAttemptResult(attemptId, studentId, isAdmin);
      if (!result) {
        return errorResponse(res, 'Attempt result not found or unauthorized', 404);
      }

      return successResponse(res, result, 'Scorecard retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get student's previous test attempts
   */
  static async getMyAttempts(req, res, next) {
    try {
      const studentId = req.user.id;
      const attempts = await TestModel.getStudentAttempts(studentId);
      return successResponse(res, attempts, 'Attempts retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get test stats and leaderboard
   */
  static async getTestStats(req, res, next) {
    try {
      const { id } = req.params;
      const stats = await TestModel.getTestStats(id);
      if (!stats) {
        return errorResponse(res, 'Test not found', 404);
      }
      return successResponse(res, stats, 'Leaderboard retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TestController;

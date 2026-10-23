const ChallengeModel = require('../models/challenge.model');
const { sendSuccess, sendCreated } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Get today's daily challenge + student attempt status
 */
const getTodayChallenge = catchAsync(async (req, res, next) => {
  const studentId = req.userRole === 'student' ? req.user.id : null;
  const challenge = await ChallengeModel.getTodayChallenge(studentId);
  const streak = studentId ? await ChallengeModel.getStudentStreak(studentId) : null;

  sendSuccess(res, { challenge, streak }, 'Today challenge retrieved');
});

/**
 * Submit daily challenge answer
 */
const submitChallenge = catchAsync(async (req, res, next) => {
  const studentId = req.user.id;
  const challengeId = parseInt(req.params.id, 10);
  const { selected_option } = req.body;

  if (!selected_option || !['A', 'B', 'C', 'D'].includes(selected_option.toUpperCase())) {
    return next(new AppError('Please select a valid option (A, B, C, or D).', 400));
  }

  const result = await ChallengeModel.submitAttempt(studentId, challengeId, selected_option);
  sendSuccess(res, result, result.is_correct ? 'Correct answer! Points awarded.' : 'Incorrect answer. Review explanation.');
});

/**
 * Get top 10 leaderboard
 */
const getLeaderboard = catchAsync(async (req, res, next) => {
  const leaderboard = await ChallengeModel.getLeaderboard(10);
  sendSuccess(res, leaderboard, 'Leaderboard retrieved successfully');
});

/**
 * Admin: Get all challenges
 */
const getAllChallengesAdmin = catchAsync(async (req, res, next) => {
  const challenges = await ChallengeModel.findAllChallenges();
  sendSuccess(res, challenges, 'Challenges retrieved successfully');
});

/**
 * Admin: Create challenge
 */
const createChallengeAdmin = catchAsync(async (req, res, next) => {
  const { challenge_date, title, points, question } = req.body;

  if (!challenge_date || !title || !question || !question.question_text || !question.correct_option) {
    return next(new AppError('Please provide challenge date, title, and question details.', 400));
  }

  const challengeId = await ChallengeModel.createChallenge({
    challenge_date,
    title,
    points,
    question,
  });

  sendCreated(res, { id: challengeId }, 'Daily challenge created successfully');
});

/**
 * Admin: Delete challenge
 */
const deleteChallengeAdmin = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const deleted = await ChallengeModel.deleteChallenge(id);
  if (!deleted) {
    return next(new AppError('Challenge not found.', 404));
  }
  sendSuccess(res, null, 'Challenge deleted successfully');
});

module.exports = {
  getTodayChallenge,
  submitChallenge,
  getLeaderboard,
  getAllChallengesAdmin,
  createChallengeAdmin,
  deleteChallengeAdmin,
};

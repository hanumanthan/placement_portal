const VocabularyModel = require('../models/vocabulary.model');
const { sendSuccess, sendCreated } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Get word of the day
 */
const getWordOfTheDay = catchAsync(async (req, res, next) => {
  const studentId = req.userRole === 'student' ? req.user.id : null;
  const word = await VocabularyModel.getWordOfTheDay(studentId);
  sendSuccess(res, word, 'Word of the day retrieved');
});

/**
 * Get vocabulary list
 */
const getVocabularyList = catchAsync(async (req, res, next) => {
  const studentId = req.userRole === 'student' ? req.user.id : null;
  const { search, difficulty, status, page = 1, limit = 20 } = req.query;

  const data = await VocabularyModel.findAll({
    studentId,
    search,
    difficulty,
    status,
    page,
    limit,
  });

  sendSuccess(res, data, 'Vocabulary retrieved successfully');
});

/**
 * Update student word status ('known' or 'practice_again')
 */
const updateStudentStatus = catchAsync(async (req, res, next) => {
  const studentId = req.user.id;
  const vocabId = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (!status || !['known', 'practice_again'].includes(status)) {
    return next(new AppError('Invalid status. Must be "known" or "practice_again".', 400));
  }

  await VocabularyModel.updateStudentStatus(studentId, vocabId, status);
  sendSuccess(res, { vocab_id: vocabId, status }, 'Status updated successfully');
});

/**
 * Admin: Create word
 */
const createVocabAdmin = catchAsync(async (req, res, next) => {
  const { word, pronunciation, part_of_speech, definition, example_sentence, synonyms, antonyms, difficulty } = req.body;

  if (!word || !definition) {
    return next(new AppError('Word and definition are required.', 400));
  }

  const id = await VocabularyModel.createVocab({
    word,
    pronunciation,
    part_of_speech,
    definition,
    example_sentence,
    synonyms,
    antonyms,
    difficulty,
  });

  sendCreated(res, { id }, 'Vocabulary word created successfully');
});

/**
 * Admin: Update word
 */
const updateVocabAdmin = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const { word, pronunciation, part_of_speech, definition, example_sentence, synonyms, antonyms, difficulty } = req.body;

  const updated = await VocabularyModel.updateVocab(id, {
    word,
    pronunciation,
    part_of_speech,
    definition,
    example_sentence,
    synonyms,
    antonyms,
    difficulty,
  });

  if (!updated) {
    return next(new AppError('Vocabulary word not found.', 404));
  }

  sendSuccess(res, null, 'Vocabulary word updated successfully');
});

/**
 * Admin: Delete word
 */
const deleteVocabAdmin = catchAsync(async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  const deleted = await VocabularyModel.deleteVocab(id);

  if (!deleted) {
    return next(new AppError('Vocabulary word not found.', 404));
  }

  sendSuccess(res, null, 'Vocabulary word deleted successfully');
});

module.exports = {
  getWordOfTheDay,
  getVocabularyList,
  updateStudentStatus,
  createVocabAdmin,
  updateVocabAdmin,
  deleteVocabAdmin,
};

const db = require('../config/db');

class TestModel {
  /**
   * Find all tests with optional filters and student attempt info
   */
  static async findAll({ is_published, category, difficulty, search, studentId } = {}) {
    let sql = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.category,
        t.duration_minutes,
        t.total_marks,
        t.pass_percentage,
        t.difficulty,
        t.max_attempts,
        t.is_published,
        t.schedule_start,
        t.schedule_end,
        t.created_at,
        COUNT(DISTINCT tq.id) AS total_questions,
        COUNT(DISTINCT ta.id) AS total_attempts
    `;

    if (studentId) {
      sql += `,
        MAX(CASE WHEN ta.student_id = ? AND ta.status = 'completed' THEN ta.score ELSE NULL END) AS student_best_score,
        MAX(CASE WHEN ta.student_id = ? AND ta.status = 'completed' THEN ta.percentage ELSE NULL END) AS student_best_percentage,
        COUNT(DISTINCT CASE WHEN ta.student_id = ? AND ta.status = 'completed' THEN ta.id END) AS student_attempt_count,
        MAX(CASE WHEN ta.student_id = ? AND ta.status = 'in_progress' THEN ta.id ELSE NULL END) AS active_attempt_id
      `;
    }

    sql += `
      FROM tests t
      LEFT JOIN test_questions tq ON t.id = tq.test_id
      LEFT JOIN test_attempts ta ON t.id = ta.test_id
      WHERE 1=1
    `;

    const params = [];
    if (studentId) {
      params.push(studentId, studentId, studentId, studentId);
    }

    if (is_published !== undefined) {
      sql += ` AND t.is_published = ?`;
      params.push(is_published ? 1 : 0);
    }

    if (category) {
      sql += ` AND t.category = ?`;
      params.push(category);
    }

    if (difficulty) {
      sql += ` AND t.difficulty = ?`;
      params.push(difficulty);
    }

    if (search) {
      sql += ` AND (t.title LIKE ? OR t.description LIKE ? OR t.category LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += `
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;

    const [rows] = await db.query(sql, params);
    return rows;
  }

  /**
   * Find test by ID with question list (answers omitted by default for students)
   */
  static async findById(id, { includeAnswers = false } = {}) {
    const [tests] = await db.query(
      `SELECT t.*, COUNT(tq.id) AS question_count
       FROM tests t
       LEFT JOIN test_questions tq ON t.id = tq.test_id
       WHERE t.id = ?
       GROUP BY t.id`,
      [id]
    );

    if (tests.length === 0) return null;
    const test = tests[0];

    let questionFields = `id, test_id, question_text, option_a, option_b, option_c, option_d, marks, category`;
    if (includeAnswers) {
      questionFields += `, correct_option, explanation`;
    }

    const [questions] = await db.query(
      `SELECT ${questionFields} FROM test_questions WHERE test_id = ? ORDER BY id ASC`,
      [id]
    );

    test.questions = questions;
    return test;
  }

  /**
   * Create a new test (Admin)
   */
  static async create(testData) {
    const {
      title,
      description,
      category = 'General Aptitude',
      duration_minutes = 30,
      total_marks = 30,
      pass_percentage = 60.0,
      difficulty = 'medium',
      max_attempts = 1,
      is_published = true,
      schedule_start = null,
      schedule_end = null,
    } = testData;

    const [result] = await db.query(
      `INSERT INTO tests 
       (title, description, category, duration_minutes, total_marks, pass_percentage, difficulty, max_attempts, is_published, schedule_start, schedule_end)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        category,
        duration_minutes,
        total_marks,
        pass_percentage,
        difficulty,
        max_attempts,
        is_published ? 1 : 0,
        schedule_start || null,
        schedule_end || null,
      ]
    );

    return result.insertId;
  }

  /**
   * Update test (Admin)
   */
  static async update(id, testData) {
    const {
      title,
      description,
      category,
      duration_minutes,
      total_marks,
      pass_percentage,
      difficulty,
      max_attempts,
      is_published,
      schedule_start,
      schedule_end,
    } = testData;

    const [result] = await db.query(
      `UPDATE tests SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        duration_minutes = COALESCE(?, duration_minutes),
        total_marks = COALESCE(?, total_marks),
        pass_percentage = COALESCE(?, pass_percentage),
        difficulty = COALESCE(?, difficulty),
        max_attempts = COALESCE(?, max_attempts),
        is_published = COALESCE(?, is_published),
        schedule_start = ?,
        schedule_end = ?
       WHERE id = ?`,
      [
        title,
        description,
        category,
        duration_minutes,
        total_marks,
        pass_percentage,
        difficulty,
        max_attempts,
        is_published !== undefined ? (is_published ? 1 : 0) : null,
        schedule_start !== undefined ? schedule_start : null,
        schedule_end !== undefined ? schedule_end : null,
        id,
      ]
    );

    return result.affectedRows > 0;
  }

  /**
   * Delete test (Admin)
   */
  static async delete(id) {
    const [result] = await db.query(`DELETE FROM tests WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Add question to test (Admin)
   */
  static async addQuestion(testId, questionData) {
    const {
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      marks = 1,
      category = 'Aptitude',
      explanation = null,
    } = questionData;

    const [result] = await db.query(
      `INSERT INTO test_questions 
       (test_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, category, explanation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testId,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        marks,
        category,
        explanation,
      ]
    );

    // Update test total marks
    await db.query(
      `UPDATE tests SET total_marks = (SELECT COALESCE(SUM(marks), 0) FROM test_questions WHERE test_id = ?) WHERE id = ?`,
      [testId, testId]
    );

    return result.insertId;
  }

  /**
   * Update question (Admin)
   */
  static async updateQuestion(questionId, questionData) {
    const {
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      marks,
      category,
      explanation,
    } = questionData;

    const [result] = await db.query(
      `UPDATE test_questions SET
        question_text = COALESCE(?, question_text),
        option_a = COALESCE(?, option_a),
        option_b = COALESCE(?, option_b),
        option_c = COALESCE(?, option_c),
        option_d = COALESCE(?, option_d),
        correct_option = COALESCE(?, correct_option),
        marks = COALESCE(?, marks),
        category = COALESCE(?, category),
        explanation = COALESCE(?, explanation)
       WHERE id = ?`,
      [
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        marks,
        category,
        explanation,
        questionId,
      ]
    );

    return result.affectedRows > 0;
  }

  /**
   * Delete question (Admin)
   */
  static async deleteQuestion(questionId) {
    const [q] = await db.query(`SELECT test_id FROM test_questions WHERE id = ?`, [questionId]);
    if (q.length === 0) return false;
    const testId = q[0].test_id;

    const [result] = await db.query(`DELETE FROM test_questions WHERE id = ?`, [questionId]);
    
    // Update test total marks
    await db.query(
      `UPDATE tests SET total_marks = (SELECT COALESCE(SUM(marks), 0) FROM test_questions WHERE test_id = ?) WHERE id = ?`,
      [testId, testId]
    );

    return result.affectedRows > 0;
  }

  /**
   * Start or resume test attempt (Student)
   */
  static async startAttempt(testId, studentId) {
    const [testRows] = await db.query(`SELECT * FROM tests WHERE id = ?`, [testId]);
    if (testRows.length === 0) {
      throw new Error('Test not found');
    }
    const test = testRows[0];

    if (!test.is_published) {
      throw new Error('This test is not currently published');
    }

    // Check for an existing in_progress attempt
    const [activeAttempts] = await db.query(
      `SELECT * FROM test_attempts 
       WHERE test_id = ? AND student_id = ? AND status = 'in_progress'
       ORDER BY started_at DESC LIMIT 1`,
      [testId, studentId]
    );

    if (activeAttempts.length > 0) {
      const active = activeAttempts[0];
      // Check if time expired
      const startTime = new Date(active.started_at).getTime();
      const maxAllowed = startTime + (test.duration_minutes + 2) * 60 * 1000;
      if (Date.now() <= maxAllowed) {
        return {
          attempt_id: active.id,
          started_at: active.started_at,
          duration_minutes: test.duration_minutes,
          resumed: true,
        };
      } else {
        // Mark as timed_out
        await db.query(`UPDATE test_attempts SET status = 'timed_out' WHERE id = ?`, [active.id]);
      }
    }

    // Check max attempts
    const [completed] = await db.query(
      `SELECT COUNT(*) AS count FROM test_attempts 
       WHERE test_id = ? AND student_id = ? AND status IN ('completed', 'timed_out')`,
      [testId, studentId]
    );

    if (test.max_attempts > 0 && completed[0].count >= test.max_attempts) {
      throw new Error(`You have reached the maximum allowed attempts (${test.max_attempts}) for this test`);
    }

    // Create new attempt
    const [insertResult] = await db.query(
      `INSERT INTO test_attempts (student_id, test_id, started_at, status)
       VALUES (?, ?, NOW(), 'in_progress')`,
      [studentId, testId]
    );

    return {
      attempt_id: insertResult.insertId,
      started_at: new Date(),
      duration_minutes: test.duration_minutes,
      resumed: false,
    };
  }

  /**
   * Submit test attempt (Student)
   */
  static async submitAttempt(attemptId, studentId, answers = []) {
    const [attempts] = await db.query(
      `SELECT ta.*, t.duration_minutes, t.pass_percentage, t.total_marks
       FROM test_attempts ta
       JOIN tests t ON ta.test_id = t.id
       WHERE ta.id = ? AND ta.student_id = ?`,
      [attemptId, studentId]
    );

    if (attempts.length === 0) {
      throw new Error('Test attempt not found or unauthorized');
    }

    const attempt = attempts[0];
    if (attempt.status === 'completed') {
      throw new Error('This attempt has already been submitted');
    }

    // Fetch all test questions with correct options & marks
    const [questions] = await db.query(
      `SELECT id, correct_option, marks FROM test_questions WHERE test_id = ?`,
      [attempt.test_id]
    );

    const questionMap = new Map();
    questions.forEach((q) => questionMap.set(q.id, q));

    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    // Delete existing partial answers for this attempt if any
    await db.query(`DELETE FROM test_answers WHERE attempt_id = ?`, [attemptId]);

    // Format and calculate answers
    const answersToInsert = [];
    const submittedMap = new Map();
    answers.forEach((ans) => submittedMap.set(ans.question_id, ans.selected_option));

    for (const q of questions) {
      const selected = submittedMap.get(q.id);
      let isCorrect = false;

      if (!selected) {
        skippedCount++;
      } else if (selected.toUpperCase() === q.correct_option.toUpperCase()) {
        isCorrect = true;
        correctCount++;
        totalScore += Number(q.marks || 1);
      } else {
        wrongCount++;
      }

      answersToInsert.push([
        attemptId,
        q.id,
        selected ? selected.toUpperCase() : null,
        isCorrect ? 1 : 0,
        0,
      ]);
    }

    if (answersToInsert.length > 0) {
      await db.query(
        `INSERT INTO test_answers (attempt_id, question_id, selected_option, is_correct, is_flagged)
         VALUES ?`,
        [answersToInsert]
      );
    }

    const totalQuestions = questions.length;
    const testTotalMarks = attempt.total_marks || totalQuestions;
    const percentage = testTotalMarks > 0 ? (totalScore / testTotalMarks) * 100 : 0;
    const isPassed = percentage >= Number(attempt.pass_percentage);

    await db.query(
      `UPDATE test_attempts SET
        submitted_at = NOW(),
        score = ?,
        percentage = ?,
        total_questions = ?,
        correct_answers = ?,
        wrong_answers = ?,
        skipped_answers = ?,
        status = 'completed'
       WHERE id = ?`,
      [
        totalScore,
        percentage.toFixed(2),
        totalQuestions,
        correctCount,
        wrongCount,
        skippedCount,
        attemptId,
      ]
    );

    return {
      attempt_id: attemptId,
      score: totalScore,
      total_marks: testTotalMarks,
      percentage: Number(percentage.toFixed(2)),
      is_passed: isPassed,
      total_questions: totalQuestions,
      correct_answers: correctCount,
      wrong_answers: wrongCount,
      skipped_answers: skippedCount,
    };
  }

  /**
   * Get full detailed scorecard and breakdown of an attempt
   */
  static async getAttemptResult(attemptId, studentId, isAdmin = false) {
    let attemptQuery = `
      SELECT 
        ta.*,
        t.title AS test_title,
        t.description AS test_description,
        t.category AS test_category,
        t.duration_minutes,
        t.pass_percentage,
        t.total_marks AS test_total_marks,
        s.full_name,
        s.register_number,
        s.department
      FROM test_attempts ta
      JOIN tests t ON ta.test_id = t.id
      JOIN students s ON ta.student_id = s.id
      WHERE ta.id = ?
    `;

    const params = [attemptId];
    if (!isAdmin && studentId) {
      attemptQuery += ` AND ta.student_id = ?`;
      params.push(studentId);
    }

    const [attempts] = await db.query(attemptQuery, params);
    if (attempts.length === 0) return null;
    const attempt = attempts[0];

    // Fetch questions with user's selected answers and correct answers
    const [questionRows] = await db.query(
      `SELECT 
        tq.id,
        tq.question_text,
        tq.option_a,
        tq.option_b,
        tq.option_c,
        tq.option_d,
        tq.correct_option,
        tq.marks,
        tq.category,
        tq.explanation,
        ans.selected_option,
        ans.is_correct
       FROM test_questions tq
       LEFT JOIN test_answers ans ON tq.id = ans.question_id AND ans.attempt_id = ?
       WHERE tq.test_id = ?
       ORDER BY tq.id ASC`,
      [attemptId, attempt.test_id]
    );

    attempt.questions = questionRows;
    return attempt;
  }

  /**
   * Get student's historical attempts
   */
  static async getStudentAttempts(studentId) {
    const [rows] = await db.query(
      `SELECT 
        ta.*,
        t.title AS test_title,
        t.category AS test_category,
        t.duration_minutes,
        t.pass_percentage,
        t.total_marks AS test_total_marks
       FROM test_attempts ta
       JOIN tests t ON ta.test_id = t.id
       WHERE ta.student_id = ?
       ORDER BY ta.started_at DESC`,
      [studentId]
    );
    return rows;
  }

  /**
   * Get test leaderboard and attempts statistics (Admin)
   */
  static async getTestStats(testId) {
    const [test] = await db.query(`SELECT * FROM tests WHERE id = ?`, [testId]);
    if (test.length === 0) return null;

    const [attempts] = await db.query(
      `SELECT 
        ta.*,
        s.full_name,
        s.register_number,
        s.department,
        sp.photo_url AS profile_photo_url
       FROM test_attempts ta
       JOIN students s ON ta.student_id = s.id
       LEFT JOIN student_profiles sp ON s.id = sp.student_id
       WHERE ta.test_id = ? AND ta.status = 'completed'
       ORDER BY ta.score DESC, ta.submitted_at ASC`,
      [testId]
    );

    const totalAttempts = attempts.length;
    let avgScore = 0;
    let passCount = 0;

    if (totalAttempts > 0) {
      const sumScore = attempts.reduce((acc, curr) => acc + Number(curr.score), 0);
      avgScore = Number((sumScore / totalAttempts).toFixed(2));
      passCount = attempts.filter((a) => Number(a.percentage) >= Number(test[0].pass_percentage)).length;
    }

    return {
      test: test[0],
      total_attempts: totalAttempts,
      average_score: avgScore,
      pass_count: passCount,
      pass_rate: totalAttempts > 0 ? Number(((passCount / totalAttempts) * 100).toFixed(1)) : 0,
      leaderboard: attempts,
    };
  }
}

module.exports = TestModel;

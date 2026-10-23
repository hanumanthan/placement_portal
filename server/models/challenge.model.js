const pool = require('../config/db');

class ChallengeModel {
  /**
   * Get today's active daily challenge for a student
   * If student has already answered, include their answer, correctness, and explanation
   * If not answered yet, mask the correct_option and explanation
   */
  static async getTodayChallenge(studentId) {
    // 1. Fetch challenge for today
    const [challenges] = await pool.query(
      `SELECT id, challenge_date, title, points, created_at
       FROM daily_challenges
       WHERE challenge_date = CURDATE()
       LIMIT 1`
    );

    if (challenges.length === 0) {
      // Fallback: get the most recent challenge
      const [recent] = await pool.query(
        `SELECT id, challenge_date, title, points, created_at
         FROM daily_challenges
         ORDER BY challenge_date DESC
         LIMIT 1`
      );
      if (recent.length === 0) return null;
      challenges.push(recent[0]);
    }

    const challenge = challenges[0];

    // 2. Fetch challenge question
    const [questions] = await pool.query(
      `SELECT id, challenge_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation
       FROM challenge_questions
       WHERE challenge_id = ?
       LIMIT 1`,
      [challenge.id]
    );

    if (questions.length === 0) return null;
    const question = questions[0];

    // 3. Check if student already attempted
    let attempt = null;
    if (studentId) {
      const [attempts] = await pool.query(
        `SELECT id, selected_option, is_correct, points_awarded, attempted_at
         FROM challenge_attempts
         WHERE challenge_id = ? AND student_id = ?
         LIMIT 1`,
        [challenge.id, studentId]
      );
      if (attempts.length > 0) {
        attempt = attempts[0];
      }
    }

    // 4. Return masked or unmasked question
    const isAttempted = !!attempt;
    return {
      id: challenge.id,
      title: challenge.title,
      challenge_date: challenge.challenge_date,
      points: challenge.points,
      is_attempted: isAttempted,
      attempt,
      question: {
        id: question.id,
        question_text: question.question_text,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_option: isAttempted ? question.correct_option : null,
        explanation: isAttempted ? question.explanation : null,
      },
    };
  }

  /**
   * Submit student answer for daily challenge
   * Computes correctness, awards points, updates streaks atomically
   */
  static async submitAttempt(studentId, challengeId, selectedOption) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Check if already attempted
      const [existing] = await conn.query(
        `SELECT id FROM challenge_attempts WHERE challenge_id = ? AND student_id = ? LIMIT 1`,
        [challengeId, studentId]
      );
      if (existing.length > 0) {
        throw new Error('You have already submitted an answer for this daily challenge.');
      }

      // Fetch challenge & question
      const [challenges] = await conn.query(
        `SELECT c.id, c.points, q.correct_option, q.explanation
         FROM daily_challenges c
         JOIN challenge_questions q ON c.id = q.challenge_id
         WHERE c.id = ?
         LIMIT 1`,
        [challengeId]
      );

      if (challenges.length === 0) {
        throw new Error('Challenge not found.');
      }

      const { points, correct_option, explanation } = challenges[0];
      const isCorrect = selectedOption.toUpperCase() === correct_option.toUpperCase();
      const pointsAwarded = isCorrect ? points : 0;

      // Insert attempt record
      await conn.query(
        `INSERT INTO challenge_attempts (challenge_id, student_id, selected_option, is_correct, points_awarded)
         VALUES (?, ?, ?, ?, ?)`,
        [challengeId, studentId, selectedOption.toUpperCase(), isCorrect, pointsAwarded]
      );

      // Streak update logic
      const [streakRows] = await conn.query(
        `SELECT current_streak, max_streak, last_activity_date, total_points, challenges_completed
         FROM student_streaks
         WHERE student_id = ?
         FOR UPDATE`,
        [studentId]
      );

      let currentStreak = 1;
      let maxStreak = 1;
      let totalPoints = pointsAwarded;
      let challengesCompleted = 1;

      if (streakRows.length > 0) {
        const s = streakRows[0];
        const lastDate = s.last_activity_date ? new Date(s.last_activity_date).toISOString().split('T')[0] : null;
        const today = new Date().toISOString().split('T')[0];

        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        if (lastDate === today) {
          // Already completed an activity today
          currentStreak = s.current_streak;
        } else if (lastDate === yesterday) {
          // Consecutive day streak increment
          currentStreak = s.current_streak + 1;
        } else {
          // Missed a day or first time
          currentStreak = 1;
        }

        maxStreak = Math.max(s.max_streak, currentStreak);
        totalPoints = s.total_points + pointsAwarded;
        challengesCompleted = s.challenges_completed + 1;

        await conn.query(
          `UPDATE student_streaks
           SET current_streak = ?, max_streak = ?, last_activity_date = CURDATE(), total_points = ?, challenges_completed = ?
           WHERE student_id = ?`,
          [currentStreak, maxStreak, totalPoints, challengesCompleted, studentId]
        );
      } else {
        await conn.query(
          `INSERT INTO student_streaks (student_id, current_streak, max_streak, last_activity_date, total_points, challenges_completed)
           VALUES (?, ?, ?, CURDATE(), ?, ?)`,
          [studentId, currentStreak, maxStreak, totalPoints, challengesCompleted]
        );
      }

      await conn.commit();

      return {
        is_correct: isCorrect,
        correct_option,
        explanation,
        points_awarded: pointsAwarded,
        current_streak: currentStreak,
        max_streak: maxStreak,
        total_points: totalPoints,
        challenges_completed: challengesCompleted,
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Get Top 10 Leaderboard students
   */
  static async getLeaderboard(limit = 10) {
    const [rows] = await pool.query(
      `SELECT s.id, s.full_name, s.department, s.course,
              COALESCE(st.current_streak, 0) AS current_streak,
              COALESCE(st.max_streak, 0) AS max_streak,
              COALESCE(st.total_points, 0) AS total_points,
              COALESCE(st.challenges_completed, 0) AS challenges_completed,
              p.photo_url
       FROM students s
       LEFT JOIN student_streaks st ON s.id = st.student_id
       LEFT JOIN student_profiles p ON s.id = p.student_id
       WHERE s.is_active = TRUE
       ORDER BY st.total_points DESC, st.current_streak DESC, s.full_name ASC
       LIMIT ?`,
      [parseInt(limit, 10)]
    );

    return rows.map((r, idx) => ({
      rank: idx + 1,
      ...r,
    }));
  }

  /**
   * Get student's current streak summary
   */
  static async getStudentStreak(studentId) {
    const [rows] = await pool.query(
      `SELECT current_streak, max_streak, last_activity_date, total_points, challenges_completed
       FROM student_streaks
       WHERE student_id = ?
       LIMIT 1`,
      [studentId]
    );

    return rows[0] || {
      current_streak: 0,
      max_streak: 0,
      total_points: 0,
      challenges_completed: 0,
      last_activity_date: null,
    };
  }

  /**
   * Admin: Get all challenges with attempts count
   */
  static async findAllChallenges() {
    const [rows] = await pool.query(
      `SELECT c.id, c.challenge_date, c.title, c.points, c.created_at,
              q.question_text, q.correct_option,
              COUNT(a.id) AS total_attempts,
              SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) AS correct_attempts
       FROM daily_challenges c
       LEFT JOIN challenge_questions q ON c.id = q.challenge_id
       LEFT JOIN challenge_attempts a ON c.id = a.challenge_id
       GROUP BY c.id, q.id
       ORDER BY c.challenge_date DESC`
    );
    return rows;
  }

  /**
   * Admin: Create a new daily challenge with question
   */
  static async createChallenge({ challenge_date, title, points, question }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [cResult] = await conn.query(
        `INSERT INTO daily_challenges (challenge_date, title, points) VALUES (?, ?, ?)`,
        [challenge_date, title, points || 15]
      );
      const challengeId = cResult.insertId;

      await conn.query(
        `INSERT INTO challenge_questions (challenge_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          challengeId,
          question.question_text,
          question.option_a,
          question.option_b,
          question.option_c,
          question.option_d,
          question.correct_option.toUpperCase(),
          question.explanation,
        ]
      );

      await conn.commit();
      return challengeId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Admin: Delete challenge
   */
  static async deleteChallenge(id) {
    const [result] = await pool.query(`DELETE FROM daily_challenges WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ChallengeModel;

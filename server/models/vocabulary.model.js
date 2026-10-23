const pool = require('../config/db');

class VocabularyModel {
  /**
   * Get word of the day
   */
  static async getWordOfTheDay(studentId = null) {
    // Select a deterministic word based on day of year
    const [rows] = await pool.query(
      `SELECT v.*,
              COALESCE(sv.status, 'unlearned') AS student_status
       FROM vocabulary v
       LEFT JOIN student_vocabulary sv ON v.id = sv.vocab_id AND sv.student_id = ?
       ORDER BY v.id ASC
       LIMIT 1`,
      [studentId]
    );

    return rows[0] || null;
  }

  /**
   * Get vocabulary list with filters and student progress
   */
  static async findAll({ studentId = null, search = '', difficulty = '', status = '', page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT v.*,
             COALESCE(sv.status, 'unlearned') AS student_status,
             sv.updated_at AS last_reviewed_at
      FROM vocabulary v
      LEFT JOIN student_vocabulary sv ON v.id = sv.vocab_id AND sv.student_id = ?
      WHERE 1=1
    `;
    const params = [studentId];

    if (search) {
      query += ` AND (v.word LIKE ? OR v.definition LIKE ? OR v.synonyms LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (difficulty) {
      query += ` AND v.difficulty = ?`;
      params.push(difficulty);
    }

    if (status) {
      if (status === 'unlearned') {
        query += ` AND sv.status IS NULL`;
      } else {
        query += ` AND sv.status = ?`;
        params.push(status);
      }
    }

    // Count total
    const countQuery = `SELECT COUNT(*) AS total FROM (${query}) AS sub`;
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0]?.total || 0;

    // Fetch page
    query += ` ORDER BY v.word ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await pool.query(query, params);

    return {
      items: rows,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update student status ('known' or 'practice_again')
   */
  static async updateStudentStatus(studentId, vocabId, status) {
    const [result] = await pool.query(
      `INSERT INTO student_vocabulary (student_id, vocab_id, status, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = CURRENT_TIMESTAMP`,
      [studentId, vocabId, status]
    );
    return result.affectedRows > 0;
  }

  /**
   * Admin: Create word
   */
  static async createVocab({ word, pronunciation, part_of_speech, definition, example_sentence, synonyms, antonyms, difficulty }) {
    const [result] = await pool.query(
      `INSERT INTO vocabulary (word, pronunciation, part_of_speech, definition, example_sentence, synonyms, antonyms, difficulty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [word, pronunciation, part_of_speech, definition, example_sentence, synonyms, antonyms, difficulty || 'medium']
    );
    return result.insertId;
  }

  /**
   * Admin: Update word
   */
  static async updateVocab(id, { word, pronunciation, part_of_speech, definition, example_sentence, synonyms, antonyms, difficulty }) {
    const [result] = await pool.query(
      `UPDATE vocabulary
       SET word = ?, pronunciation = ?, part_of_speech = ?, definition = ?, example_sentence = ?, synonyms = ?, antonyms = ?, difficulty = ?
       WHERE id = ?`,
      [word, pronunciation, part_of_speech, definition, example_sentence, synonyms, antonyms, difficulty, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Admin: Delete word
   */
  static async deleteVocab(id) {
    const [result] = await pool.query(`DELETE FROM vocabulary WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = VocabularyModel;

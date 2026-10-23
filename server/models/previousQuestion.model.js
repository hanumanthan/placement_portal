const pool = require('../config/db');

class PreviousQuestionModel {
  /**
   * Get all previous questions with company name, supporting filters and pagination.
   * Filters: company_id, year, category, difficulty, search
   */
  static async findAll({ company_id, year, category, difficulty, search, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (company_id) {
      whereClause += ' AND pq.company_id = ?';
      params.push(parseInt(company_id, 10));
    }

    if (year) {
      whereClause += ' AND pq.year = ?';
      params.push(parseInt(year, 10));
    }

    if (category) {
      whereClause += ' AND pq.category = ?';
      params.push(category);
    }

    if (difficulty) {
      whereClause += ' AND pq.difficulty = ?';
      params.push(difficulty);
    }

    if (search) {
      whereClause += ' AND (pq.question_text LIKE ? OR pq.explanation LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM previous_questions pq ${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    // Fetch page with company name
    const [rows] = await pool.query(
      `SELECT pq.*, c.name AS company_name, c.logo_url AS company_logo
       FROM previous_questions pq
       JOIN companies c ON pq.company_id = c.id
       ${whereClause}
       ORDER BY pq.year DESC, pq.company_id ASC, pq.id ASC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), parseInt(offset, 10)]
    );

    return {
      items: rows,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single question by ID
   */
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT pq.*, c.name AS company_name, c.logo_url AS company_logo
       FROM previous_questions pq
       JOIN companies c ON pq.company_id = c.id
       WHERE pq.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Get distinct filter options for the UI dropdowns
   */
  static async getFilterOptions() {
    const [companies] = await pool.query(
      `SELECT DISTINCT c.id, c.name
       FROM previous_questions pq
       JOIN companies c ON pq.company_id = c.id
       ORDER BY c.name ASC`
    );

    const [years] = await pool.query(
      `SELECT DISTINCT year FROM previous_questions ORDER BY year DESC`
    );

    const [categories] = await pool.query(
      `SELECT DISTINCT category FROM previous_questions ORDER BY category ASC`
    );

    return {
      companies,
      years: years.map((r) => r.year),
      categories: categories.map((r) => r.category),
    };
  }

  /**
   * Admin: Create a question
   */
  static async create({ company_id, year, category, difficulty, question_text, options, correct_answer, explanation }) {
    const [result] = await pool.query(
      `INSERT INTO previous_questions (company_id, year, category, difficulty, question_text, options, correct_answer, explanation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_id, year, category, difficulty || 'medium', question_text, options || null, correct_answer || null, explanation || null]
    );
    return result.insertId;
  }

  /**
   * Admin: Update a question
   */
  static async update(id, { company_id, year, category, difficulty, question_text, options, correct_answer, explanation }) {
    const [result] = await pool.query(
      `UPDATE previous_questions
       SET company_id = ?, year = ?, category = ?, difficulty = ?, question_text = ?, options = ?, correct_answer = ?, explanation = ?
       WHERE id = ?`,
      [company_id, year, category, difficulty, question_text, options || null, correct_answer || null, explanation || null, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Admin: Delete a question
   */
  static async delete(id) {
    const [result] = await pool.query(`DELETE FROM previous_questions WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = PreviousQuestionModel;

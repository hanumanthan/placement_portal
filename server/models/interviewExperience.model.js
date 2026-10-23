const pool = require('../config/db');

class InterviewExperienceModel {
  /**
   * Get all experiences with company name, supporting filters and pagination.
   * Filters: company_id, verdict, difficulty, search
   */
  static async findAll({ company_id, verdict, difficulty, search, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (company_id) {
      whereClause += ' AND ie.company_id = ?';
      params.push(parseInt(company_id, 10));
    }

    if (verdict) {
      whereClause += ' AND ie.verdict = ?';
      params.push(verdict);
    }

    if (difficulty) {
      whereClause += ' AND ie.difficulty = ?';
      params.push(difficulty);
    }

    if (search) {
      whereClause += ' AND (ie.content LIKE ? OR ie.role_title LIKE ? OR ie.author_name LIKE ? OR ie.tips LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM interview_experiences ie ${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    // Fetch page
    const [rows] = await pool.query(
      `SELECT ie.*, c.name AS company_name, c.logo_url AS company_logo
       FROM interview_experiences ie
       JOIN companies c ON ie.company_id = c.id
       ${whereClause}
       ORDER BY ie.created_at DESC, ie.id DESC
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
   * Get a single experience by ID
   */
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT ie.*, c.name AS company_name, c.logo_url AS company_logo
       FROM interview_experiences ie
       JOIN companies c ON ie.company_id = c.id
       WHERE ie.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Get distinct filter options
   */
  static async getFilterOptions() {
    const [companies] = await pool.query(
      `SELECT DISTINCT c.id, c.name
       FROM interview_experiences ie
       JOIN companies c ON ie.company_id = c.id
       ORDER BY c.name ASC`
    );

    return { companies };
  }

  /**
   * Admin: Create an experience
   */
  static async create({ company_id, student_id, author_name, role_title, batch_year, verdict, difficulty, rounds_count, content, tips }) {
    const [result] = await pool.query(
      `INSERT INTO interview_experiences (company_id, student_id, author_name, role_title, batch_year, verdict, difficulty, rounds_count, content, tips)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_id, student_id || null, author_name, role_title, batch_year || new Date().getFullYear(), verdict || 'Selected', difficulty || 'medium', rounds_count || 3, content, tips || null]
    );
    return result.insertId;
  }

  /**
   * Admin: Update an experience
   */
  static async update(id, { company_id, author_name, role_title, batch_year, verdict, difficulty, rounds_count, content, tips }) {
    const [result] = await pool.query(
      `UPDATE interview_experiences
       SET company_id = ?, author_name = ?, role_title = ?, batch_year = ?, verdict = ?, difficulty = ?, rounds_count = ?, content = ?, tips = ?
       WHERE id = ?`,
      [company_id, author_name, role_title, batch_year, verdict, difficulty, rounds_count, content, tips || null, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Admin: Delete an experience
   */
  static async delete(id) {
    const [result] = await pool.query(`DELETE FROM interview_experiences WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = InterviewExperienceModel;

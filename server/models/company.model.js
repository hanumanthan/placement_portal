const pool = require('../config/db');

class CompanyModel {
  /**
   * Find all companies with search, industry filter, and pagination
   */
  static async findAll({ search = '', industry = '', page = 1, limit = 20 } = {}) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    let whereConditions = [];

    if (search) {
      whereConditions.push('(name LIKE ? OR description LIKE ? OR headquarters LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (industry) {
      whereConditions.push('industry = ?');
      params.push(industry);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Total count query
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM companies ${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    // Data query with drive counts
    const [rows] = await pool.query(
      `SELECT c.*,
              COUNT(DISTINCT pd.id) AS total_drives,
              COUNT(DISTINCT ch.id) AS history_records_count
       FROM companies c
       LEFT JOIN placement_drives pd ON c.id = pd.company_id
       LEFT JOIN company_history ch ON c.id = ch.company_id
       ${whereClause}
       GROUP BY c.id
       ORDER BY c.name ASC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), parseInt(offset, 10)]
    );

    return {
      companies: rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      },
    };
  }

  /**
   * Find company by ID with full recruitment history, drives, questions count, and reviews count
   */
  static async findById(id) {
    const [companies] = await pool.query(`SELECT * FROM companies WHERE id = ?`, [id]);
    if (companies.length === 0) return null;

    const company = companies[0];

    // Fetch placement history
    const [history] = await pool.query(
      `SELECT * FROM company_history WHERE company_id = ? ORDER BY year DESC`,
      [id]
    );
    company.history = history;

    // Fetch drives for this company
    const [drives] = await pool.query(
      `SELECT pd.*,
              (SELECT COUNT(*) FROM applications WHERE drive_id = pd.id) AS total_applications
       FROM placement_drives pd
       WHERE pd.company_id = ?
       ORDER BY pd.drive_date DESC`,
      [id]
    );
    company.drives = drives;

    // Fetch previous questions count
    const [qCount] = await pool.query(
      `SELECT COUNT(*) AS count FROM previous_questions WHERE company_id = ?`,
      [id]
    );
    company.previous_questions_count = qCount[0]?.count || 0;

    // Fetch interview experiences count
    const [ieCount] = await pool.query(
      `SELECT COUNT(*) AS count FROM interview_experiences WHERE company_id = ?`,
      [id]
    );
    company.interview_experiences_count = ieCount[0]?.count || 0;

    return company;
  }

  /**
   * Create a new company
   */
  static async create({ name, website, industry, headquarters, description, logo_url }) {
    const [result] = await pool.query(
      `INSERT INTO companies (name, website, industry, headquarters, description, logo_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, website, industry || 'Information Technology', headquarters, description, logo_url || null]
    );
    return result.insertId;
  }

  /**
   * Update an existing company
   */
  static async update(id, { name, website, industry, headquarters, description, logo_url }) {
    const [result] = await pool.query(
      `UPDATE companies SET
        name = COALESCE(?, name),
        website = COALESCE(?, website),
        industry = COALESCE(?, industry),
        headquarters = COALESCE(?, headquarters),
        description = COALESCE(?, description),
        logo_url = COALESCE(?, logo_url)
       WHERE id = ?`,
      [name, website, industry, headquarters, description, logo_url, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Delete a company
   */
  static async delete(id) {
    const [result] = await pool.query(`DELETE FROM companies WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = CompanyModel;

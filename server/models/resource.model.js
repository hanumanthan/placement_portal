const pool = require('../config/db');

class ResourceModel {
  /**
   * Get all resources with category/file_type filters and pagination.
   */
  static async findAll({ category, file_type, search, page = 1, limit = 12 }) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (category) {
      whereClause += ' AND r.category = ?';
      params.push(category);
    }

    if (file_type) {
      whereClause += ' AND r.file_type = ?';
      params.push(file_type);
    }

    if (search) {
      whereClause += ' AND (r.title LIKE ? OR r.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM resources r ${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    // Fetch
    const [rows] = await pool.query(
      `SELECT r.*
       FROM resources r
       ${whereClause}
       ORDER BY r.id ASC
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
   * Get single resource by ID
   */
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT r.* FROM resources r WHERE r.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Get distinct categories
   */
  static async getCategories() {
    const [rows] = await pool.query(
      `SELECT DISTINCT category FROM resources ORDER BY category ASC`
    );
    return rows.map((r) => r.category);
  }

  /**
   * Admin: Create resource
   */
  static async create({ title, category, file_url, file_type, description }) {
    const [result] = await pool.query(
      `INSERT INTO resources (title, category, file_url, file_type, description)
       VALUES (?, ?, ?, ?, ?)`,
      [title, category || 'General', file_url, file_type || 'PDF', description || null]
    );
    return result.insertId;
  }

  /**
   * Admin: Update resource
   */
  static async update(id, { title, category, file_url, file_type, description }) {
    const [result] = await pool.query(
      `UPDATE resources
       SET title = ?, category = ?, file_url = ?, file_type = ?, description = ?
       WHERE id = ?`,
      [title, category || 'General', file_url, file_type || 'PDF', description || null, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Admin: Delete resource
   */
  static async delete(id) {
    const [result] = await pool.query(`DELETE FROM resources WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ResourceModel;

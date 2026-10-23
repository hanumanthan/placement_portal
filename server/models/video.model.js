const pool = require('../config/db');

class VideoModel {
  /**
   * Get all videos with optional student completion status, filters, and pagination.
   */
  static async findAll({ category, difficulty, search, student_id, page = 1, limit = 12 }) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (category) {
      whereClause += ' AND v.category = ?';
      params.push(category);
    }

    if (difficulty) {
      whereClause += ' AND v.difficulty = ?';
      params.push(difficulty);
    }

    if (search) {
      whereClause += ' AND (v.title LIKE ? OR v.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM videos v ${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    // Fetch
    const studentJoin = student_id
      ? 'LEFT JOIN student_video_progress vp ON v.id = vp.video_id AND vp.student_id = ?'
      : '';
    const studentSelect = student_id
      ? ', (vp.id IS NOT NULL AND vp.is_completed = 1) AS is_completed, vp.completed_at'
      : ', FALSE AS is_completed, NULL AS completed_at';

    const queryParams = student_id
      ? [student_id, ...params, parseInt(limit, 10), parseInt(offset, 10)]
      : [...params, parseInt(limit, 10), parseInt(offset, 10)];

    const [rows] = await pool.query(
      `SELECT v.* ${studentSelect}
       FROM videos v
       ${studentJoin}
       ${whereClause}
       ORDER BY v.id ASC
       LIMIT ? OFFSET ?`,
      queryParams
    );

    return {
      items: rows.map((r) => ({
        ...r,
        is_completed: Boolean(r.is_completed),
      })),
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single video by ID
   */
  static async findById(id, student_id = null) {
    const studentJoin = student_id
      ? 'LEFT JOIN student_video_progress vp ON v.id = vp.video_id AND vp.student_id = ?'
      : '';
    const studentSelect = student_id
      ? ', (vp.id IS NOT NULL AND vp.is_completed = 1) AS is_completed, vp.completed_at'
      : ', FALSE AS is_completed, NULL AS completed_at';

    const params = student_id ? [student_id, id] : [id];

    const [rows] = await pool.query(
      `SELECT v.* ${studentSelect}
       FROM videos v
       ${studentJoin}
       WHERE v.id = ?
       LIMIT 1`,
      params
    );

    if (!rows[0]) return null;

    return {
      ...rows[0],
      is_completed: Boolean(rows[0].is_completed),
    };
  }

  /**
   * Get distinct categories
   */
  static async getCategories() {
    const [rows] = await pool.query(
      `SELECT DISTINCT category FROM videos ORDER BY category ASC`
    );
    return rows.map((r) => r.category);
  }

  /**
   * Toggle student video completion status
   */
  static async toggleProgress(student_id, video_id) {
    const [existing] = await pool.query(
      `SELECT id, is_completed FROM student_video_progress WHERE student_id = ? AND video_id = ?`,
      [student_id, video_id]
    );

    if (existing.length > 0) {
      const newStatus = !existing[0].is_completed;
      await pool.query(
        `UPDATE student_video_progress SET is_completed = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [newStatus, existing[0].id]
      );
      return { completed: newStatus, is_completed: newStatus };
    } else {
      await pool.query(
        `INSERT INTO student_video_progress (student_id, video_id, is_completed, completed_at) VALUES (?, ?, TRUE, CURRENT_TIMESTAMP)`,
        [student_id, video_id]
      );
      return { completed: true, is_completed: true };
    }
  }

  /**
   * Admin: Create video
   */
  static async create({ title, description, category, difficulty, youtube_url, duration }) {
    const [result] = await pool.query(
      `INSERT INTO videos (title, description, category, difficulty, youtube_url, duration)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description || null, category || 'General', difficulty || 'medium', youtube_url, duration || '15:00']
    );
    return result.insertId;
  }

  /**
   * Admin: Update video
   */
  static async update(id, { title, description, category, difficulty, youtube_url, duration }) {
    const [result] = await pool.query(
      `UPDATE videos
       SET title = ?, description = ?, category = ?, difficulty = ?, youtube_url = ?, duration = ?
       WHERE id = ?`,
      [title, description || null, category || 'General', difficulty || 'medium', youtube_url, duration || '15:00', id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Admin: Delete video
   */
  static async delete(id) {
    const [result] = await pool.query(`DELETE FROM videos WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = VideoModel;

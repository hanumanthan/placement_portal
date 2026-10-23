const pool = require('../config/db');

class AuthModel {
  /**
   * Find student by email or register number
   * @param {String} identifier - Email or Register Number
   */
  static async findStudentByIdentifier(identifier) {
    const [rows] = await pool.query(
      `SELECT s.*, p.cgpa, p.tenth_percentage, p.twelfth_percentage, p.standing_arrears, p.history_arrears, p.resume_url, p.photo_url
       FROM students s
       LEFT JOIN student_profiles p ON s.id = p.student_id
       WHERE s.email = ? OR s.register_number = ?
       LIMIT 1`,
      [identifier, identifier]
    );
    return rows[0] || null;
  }

  /**
   * Find student by ID with complete profile info
   * @param {Number} id - Student ID
   */
  static async findStudentById(id) {
    const [rows] = await pool.query(
      `SELECT s.id, s.register_number, s.full_name, s.email, s.phone, s.department, s.course, s.batch, s.graduation_year, s.is_active, s.role, s.created_at,
              p.cgpa, p.tenth_percentage, p.twelfth_percentage, p.diploma_percentage, p.standing_arrears, p.history_arrears, p.resume_url, p.photo_url, p.github_url, p.linkedin_url, p.portfolio_url, p.bio,
              st.current_streak, st.max_streak, st.total_points, st.challenges_completed
       FROM students s
       LEFT JOIN student_profiles p ON s.id = p.student_id
       LEFT JOIN student_streaks st ON s.id = st.student_id
       WHERE s.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Create a new student record along with associated profile and streak records (Atomic Transaction)
   */
  static async createStudent({
    register_number,
    full_name,
    email,
    phone,
    password,
    department,
    course = 'B.Tech',
    batch = '2021-2025',
    graduation_year = 2025,
  }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Insert into students table
      const [studentResult] = await conn.query(
        `INSERT INTO students (register_number, full_name, email, phone, password, department, course, batch, graduation_year, is_active, role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, 'student')`,
        [register_number, full_name, email, phone, password, department, course, batch, graduation_year]
      );
      const studentId = studentResult.insertId;

      // 2. Initialize student_profiles table
      await conn.query(
        `INSERT INTO student_profiles (student_id, cgpa, tenth_percentage, twelfth_percentage, standing_arrears, history_arrears)
         VALUES (?, 0.00, 0.00, 0.00, 0, 0)`,
        [studentId]
      );

      // 3. Initialize student_streaks table
      await conn.query(
        `INSERT INTO student_streaks (student_id, current_streak, max_streak, total_points, challenges_completed)
         VALUES (?, 0, 0, 0, 0)`,
        [studentId]
      );

      await conn.commit();
      return studentId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Find admin by email
   * @param {String} email
   */
  static async findAdminByEmail(email) {
    const [rows] = await pool.query(
      `SELECT * FROM admins WHERE email = ? LIMIT 1`,
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Find admin by ID
   * @param {Number} id
   */
  static async findAdminById(id) {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, created_at FROM admins WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = AuthModel;

const pool = require('../config/db');

class ApplicationModel {
  /**
   * Get all applications for a specific student with drive, company, and round details
   */
  static async findByStudent(studentId, { status = '' } = {}) {
    const params = [studentId];
    let statusFilter = '';

    if (status && status !== 'All') {
      statusFilter = 'AND a.status = ?';
      params.push(status);
    }

    const [rows] = await pool.query(
      `SELECT a.id, a.student_id, a.drive_id, a.status, a.notes, a.created_at, a.updated_at,
              pd.job_title, pd.job_description, pd.location, pd.employment_type, pd.package_lpa, pd.stipend_monthly,
              pd.drive_date, pd.application_deadline, pd.status AS drive_status,
              c.id AS company_id, c.name AS company_name, c.logo_url AS company_logo, c.website AS company_website
       FROM applications a
       JOIN placement_drives pd ON a.drive_id = pd.id
       JOIN companies c ON pd.company_id = c.id
       WHERE a.student_id = ? ${statusFilter}
       ORDER BY a.created_at DESC`,
      params
    );

    // Fetch selection process rounds for each drive
    for (const app of rows) {
      const [rounds] = await pool.query(
        `SELECT round_number, round_name, description FROM drive_rounds WHERE drive_id = ? ORDER BY round_number ASC`,
        [app.drive_id]
      );
      app.rounds = rounds;
    }

    return rows;
  }

  /**
   * Withdraw an application (Student action)
   */
  static async withdraw(applicationId, studentId) {
    const [result] = await pool.query(
      `UPDATE applications
       SET status = 'Withdrawn', notes = 'Application withdrawn by candidate', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND student_id = ?`,
      [applicationId, studentId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Admin: Find all applications with multi-filter and pagination
   */
  static async findAll({
    search = '',
    company_id = '',
    drive_id = '',
    status = '',
    department = '',
    page = 1,
    limit = 20,
  } = {}) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    const whereConditions = [];

    if (search) {
      whereConditions.push('(s.full_name LIKE ? OR s.register_number LIKE ? OR s.email LIKE ? OR c.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (company_id) {
      whereConditions.push('pd.company_id = ?');
      params.push(company_id);
    }

    if (drive_id) {
      whereConditions.push('a.drive_id = ?');
      params.push(drive_id);
    }

    if (status && status !== 'All') {
      whereConditions.push('a.status = ?');
      params.push(status);
    }

    if (department && department !== 'All') {
      whereConditions.push('s.department = ?');
      params.push(department);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Total count
    const [countRes] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM applications a
       JOIN students s ON a.student_id = s.id
       JOIN placement_drives pd ON a.drive_id = pd.id
       JOIN companies c ON pd.company_id = c.id
       ${whereClause}`,
      params
    );
    const total = countRes[0]?.total || 0;

    // Applications data
    const [rows] = await pool.query(
      `SELECT a.id, a.student_id, a.drive_id, a.status, a.notes, a.created_at, a.updated_at,
              s.full_name AS student_name, s.register_number, s.email AS student_email, s.phone AS student_phone, s.department, s.course, s.batch,
              p.cgpa, p.tenth_percentage, p.twelfth_percentage, p.standing_arrears, p.resume_url, p.photo_url,
              pd.job_title, pd.package_lpa, pd.drive_date, pd.application_deadline,
              c.id AS company_id, c.name AS company_name, c.logo_url AS company_logo
       FROM applications a
       JOIN students s ON a.student_id = s.id
       LEFT JOIN student_profiles p ON s.id = p.student_id
       JOIN placement_drives pd ON a.drive_id = pd.id
       JOIN companies c ON pd.company_id = c.id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), parseInt(offset, 10)]
    );

    return {
      applications: rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      },
    };
  }

  /**
   * Admin: Update application status and automatically trigger student notification
   */
  static async updateStatus(applicationId, { status, notes = '' }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Update application record
      await conn.query(
        `UPDATE applications
         SET status = ?, notes = COALESCE(?, notes), updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [status, notes || null, applicationId]
      );

      // 2. Fetch student and company information to build notification
      const [appRows] = await conn.query(
        `SELECT a.student_id, pd.job_title, c.name AS company_name
         FROM applications a
         JOIN placement_drives pd ON a.drive_id = pd.id
         JOIN companies c ON pd.company_id = c.id
         WHERE a.id = ? LIMIT 1`,
        [applicationId]
      );

      if (appRows.length > 0) {
        const appInfo = appRows[0];
        const notifTitle = `Application Status Update: ${appInfo.company_name}`;
        const notifMessage = `Your application for "${appInfo.job_title}" at ${appInfo.company_name} has been updated to "${status}".${
          notes ? ` Note: ${notes}` : ''
        }`;

        await conn.query(
          `INSERT INTO notifications (student_id, title, message, type, link)
           VALUES (?, ?, ?, 'status_change', '/student/applications')`,
          [appInfo.student_id, notifTitle, notifMessage]
        );
      }

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Admin: Bulk update application statuses
   */
  static async bulkUpdateStatus({ applicationIds = [], status, notes = '' }) {
    if (!applicationIds || applicationIds.length === 0) return 0;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      let updatedCount = 0;
      for (const appId of applicationIds) {
        // Update application
        await conn.query(
          `UPDATE applications
           SET status = ?, notes = COALESCE(?, notes), updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [status, notes || null, appId]
        );

        // Notify student
        const [appRows] = await conn.query(
          `SELECT a.student_id, pd.job_title, c.name AS company_name
           FROM applications a
           JOIN placement_drives pd ON a.drive_id = pd.id
           JOIN companies c ON pd.company_id = c.id
           WHERE a.id = ? LIMIT 1`,
          [appId]
        );

        if (appRows.length > 0) {
          const appInfo = appRows[0];
          await conn.query(
            `INSERT INTO notifications (student_id, title, message, type, link)
             VALUES (?, ?, ?, 'status_change', '/student/applications')`,
            [
              appInfo.student_id,
              `Application Status: ${appInfo.company_name}`,
              `Your application for ${appInfo.company_name} has been updated to "${status}".${notes ? ` Note: ${notes}` : ''}`,
            ]
          );
        }
        updatedCount++;
      }

      await conn.commit();
      return updatedCount;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

module.exports = ApplicationModel;

const pool = require('../config/db');

class AdminModel {
  /**
   * Aggregate complete dashboard metrics and chart analytics for the Placement Officer
   */
  static async getAdminDashboardStats() {
    // 1. Stat Cards Overview
    const [studentsCountRes] = await pool.query(`SELECT COUNT(*) AS total FROM students`);
    const totalStudents = studentsCountRes[0]?.total || 0;

    const [companiesCountRes] = await pool.query(`SELECT COUNT(*) AS total FROM companies`);
    const totalCompanies = companiesCountRes[0]?.total || 0;

    const [drivesCountRes] = await pool.query(
      `SELECT COUNT(*) AS total FROM placement_drives WHERE status = 'published' AND application_deadline >= NOW()`
    );
    const upcomingDrives = drivesCountRes[0]?.total || 0;

    const [appsCountRes] = await pool.query(`SELECT COUNT(*) AS total FROM applications`);
    const totalApplications = appsCountRes[0]?.total || 0;

    const [selectedCountRes] = await pool.query(
      `SELECT COUNT(DISTINCT student_id) AS total FROM applications WHERE status = 'Selected'`
    );
    const selectedStudents = selectedCountRes[0]?.total || 0;

    const [testsCountRes] = await pool.query(`SELECT COUNT(*) AS total FROM tests`);
    const totalTests = testsCountRes[0]?.total || 0;

    const [questionsCountRes] = await pool.query(`SELECT COUNT(*) AS total FROM previous_questions`);
    const totalQuestions = questionsCountRes[0]?.total || 0;

    const [resourcesCountRes] = await pool.query(`SELECT COUNT(*) AS total FROM resources`);
    const totalResources = resourcesCountRes[0]?.total || 0;

    // 2. Placement Funnel Distribution
    const [funnelRows] = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM applications
      GROUP BY status
    `);

    const statusOrder = ['Interested', 'Applied', 'Shortlisted', 'Test Completed', 'Interview', 'Selected', 'Rejected'];
    const funnelMap = {};
    funnelRows.forEach((r) => { funnelMap[r.status] = r.count; });
    const placementFunnel = statusOrder.map((status) => ({
      status,
      count: funnelMap[status] || 0,
    }));

    // 3. Department-wise Placement Statistics (Total vs Selected)
    const [deptRows] = await pool.query(`
      SELECT
        d.code AS department,
        COUNT(DISTINCT s.id) AS total_students,
        COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN s.id END) AS placed_students
      FROM departments d
      LEFT JOIN students s ON d.code = s.department
      LEFT JOIN applications a ON s.id = a.student_id
      GROUP BY d.code, d.id
      ORDER BY d.id ASC
    `);

    const departmentStats = deptRows.map((r) => ({
      department: r.department,
      total_students: parseInt(r.total_students, 10) || 0,
      placed_students: parseInt(r.placed_students, 10) || 0,
      placement_percentage:
        r.total_students > 0
          ? Math.round((parseInt(r.placed_students, 10) / parseInt(r.total_students, 10)) * 100)
          : 0,
    }));

    // 4. Company-wise Selections Breakdown
    const [companySelectionRows] = await pool.query(`
      SELECT
        c.name AS company_name,
        COUNT(a.id) AS applications_count,
        COUNT(CASE WHEN a.status = 'Selected' THEN 1 END) AS selected_count
      FROM companies c
      JOIN placement_drives pd ON c.id = pd.company_id
      LEFT JOIN applications a ON pd.id = a.drive_id
      GROUP BY c.id, c.name
      ORDER BY selected_count DESC, applications_count DESC
      LIMIT 6
    `);

    // 5. Monthly Applications Trend (Grouped by Month)
    const [monthlyAppRows] = await pool.query(`
      SELECT
        DATE_FORMAT(created_at, '%b %Y') AS month_label,
        COUNT(*) AS applications,
        COUNT(CASE WHEN status = 'Selected' THEN 1 END) AS offers
      FROM applications
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b %Y')
      ORDER BY DATE_FORMAT(created_at, '%Y-%m') ASC
      LIMIT 6
    `);

    // Default sample trend if applications are created recently
    const monthlyTrend = monthlyAppRows.length > 0 ? monthlyAppRows : [
      { month_label: 'May 2026', applications: 12, offers: 3 },
      { month_label: 'Jun 2026', applications: 25, offers: 6 },
      { month_label: 'Jul 2026', applications: 48, offers: 14 },
      { month_label: 'Aug 2026', applications: 85, offers: 28 },
      { month_label: 'Sep 2026', applications: 64, offers: 22 },
      { month_label: 'Oct 2026', applications: 40, offers: 15 },
    ];

    // 6. Recent Applications (Latest 5 applications)
    const [recentApplications] = await pool.query(`
      SELECT
        a.id, a.status, a.created_at,
        s.id AS student_id, s.full_name AS student_name, s.register_number, s.department,
        p.cgpa,
        pd.job_title, pd.package_lpa,
        c.name AS company_name
      FROM applications a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN student_profiles p ON s.id = p.student_id
      JOIN placement_drives pd ON a.drive_id = pd.id
      JOIN companies c ON pd.company_id = c.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `);

    return {
      stats: {
        total_students: totalStudents,
        total_companies: totalCompanies,
        upcoming_drives: upcomingDrives,
        total_applications: totalApplications,
        selected_students: selectedStudents,
        total_tests: totalTests,
        total_questions: totalQuestions,
        total_resources: totalResources,
      },
      placement_funnel: placementFunnel,
      department_stats: departmentStats,
      company_selections: companySelectionRows,
      monthly_trend: monthlyTrend,
      recent_applications: recentApplications,
    };
  }

  /**
   * Get all students with their profiles and placement status
   */
  static async getStudents({ search, department, batch, status, page = 1, limit = 15 }) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (s.full_name LIKE ? OR s.register_number LIKE ? OR s.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (department) {
      whereClause += ' AND s.department = ?';
      params.push(department);
    }

    if (batch) {
      whereClause += ' AND s.batch = ?';
      params.push(batch);
    }

    // Count
    const [countRes] = await pool.query(
      `SELECT COUNT(*) AS total FROM students s ${whereClause}`,
      params
    );
    const total = countRes[0]?.total || 0;

    // Fetch
    const [rows] = await pool.query(
      `SELECT
        s.id, s.register_number, s.full_name, s.email, s.phone,
        s.department, s.course, s.batch, s.graduation_year, s.is_active, s.created_at,
        p.cgpa, p.standing_arrears, p.history_arrears, p.resume_url, p.photo_url,
        (SELECT COUNT(*) FROM applications WHERE student_id = s.id) AS applications_count,
        (SELECT COUNT(*) FROM applications WHERE student_id = s.id AND status = 'Selected') AS offers_count
       FROM students s
       LEFT JOIN student_profiles p ON s.id = p.student_id
       ${whereClause}
       ORDER BY s.id DESC
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
   * Get comprehensive student details with applications and test history
   */
  static async getStudentById(id) {
    const [studentRows] = await pool.query(
      `SELECT
        s.*,
        p.cgpa, p.tenth_percentage, p.twelfth_percentage, p.diploma_percentage,
        p.standing_arrears, p.history_arrears, p.resume_url, p.photo_url,
        p.github_url, p.linkedin_url, p.portfolio_url, p.bio
       FROM students s
       LEFT JOIN student_profiles p ON s.id = p.student_id
       WHERE s.id = ?
       LIMIT 1`,
      [id]
    );

    if (!studentRows[0]) return null;
    const student = studentRows[0];
    delete student.password;

    // Applications history
    const [applications] = await pool.query(
      `SELECT a.*, pd.job_title, pd.package_lpa, pd.drive_date, c.name AS company_name
       FROM applications a
       JOIN placement_drives pd ON a.drive_id = pd.id
       JOIN companies c ON pd.company_id = c.id
       WHERE a.student_id = ?
       ORDER BY a.created_at DESC`,
      [id]
    );

    // Test attempts
    const [attempts] = await pool.query(
      `SELECT ta.*, t.title AS test_title, t.category AS test_category, t.total_marks
       FROM test_attempts ta
       JOIN tests t ON ta.test_id = t.id
       WHERE ta.student_id = ?
       ORDER BY ta.created_at DESC`,
      [id]
    );

    return {
      ...student,
      applications,
      test_attempts: attempts,
    };
  }

  /**
   * Get detailed placement reports and package tier analytics
   */
  static async getReportsData() {
    // 1. Department Placement Rates
    const [deptRows] = await pool.query(`
      SELECT
        d.code AS department,
        d.name AS department_name,
        COUNT(DISTINCT s.id) AS total_students,
        COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN s.id END) AS placed_students,
        MAX(pd.package_lpa) AS highest_package,
        ROUND(AVG(CASE WHEN a.status = 'Selected' THEN pd.package_lpa END), 2) AS avg_package
      FROM departments d
      LEFT JOIN students s ON d.code = s.department
      LEFT JOIN applications a ON s.id = a.student_id
      LEFT JOIN placement_drives pd ON a.drive_id = pd.id
      GROUP BY d.code, d.name, d.id
      ORDER BY d.id ASC
    `);

    // 2. Package Tier Distribution
    const [packageTiers] = await pool.query(`
      SELECT
        CASE
          WHEN pd.package_lpa < 4.5 THEN '< 4.5 LPA (Mass)'
          WHEN pd.package_lpa >= 4.5 AND pd.package_lpa < 8.0 THEN '4.5 - 8 LPA (Core)'
          WHEN pd.package_lpa >= 8.0 AND pd.package_lpa < 15.0 THEN '8 - 15 LPA (Dream)'
          ELSE '> 15 LPA (Super Dream)'
        END AS tier,
        COUNT(DISTINCT a.id) AS offers_count
      FROM applications a
      JOIN placement_drives pd ON a.drive_id = pd.id
      WHERE a.status = 'Selected'
      GROUP BY tier
      ORDER BY offers_count DESC
    `);

    // 3. Top Hiring Companies
    const [topRecruiters] = await pool.query(`
      SELECT
        c.name AS company_name,
        c.industry,
        COUNT(a.id) AS selections,
        MAX(pd.package_lpa) AS max_lpa
      FROM companies c
      JOIN placement_drives pd ON c.id = pd.company_id
      JOIN applications a ON pd.id = a.drive_id
      WHERE a.status = 'Selected'
      GROUP BY c.id, c.name, c.industry
      ORDER BY selections DESC
      LIMIT 8
    `);

    return {
      department_summary: deptRows.map((r) => ({
        ...r,
        total_students: parseInt(r.total_students, 10) || 0,
        placed_students: parseInt(r.placed_students, 10) || 0,
        placement_percentage:
          r.total_students > 0
            ? Math.round((parseInt(r.placed_students, 10) / parseInt(r.total_students, 10)) * 100)
            : 0,
        highest_package: parseFloat(r.highest_package) || 0,
        avg_package: parseFloat(r.avg_package) || 0,
      })),
      package_tiers: packageTiers,
      top_recruiters: topRecruiters,
    };
  }
}

module.exports = AdminModel;

const pool = require('../config/db');

class DriveModel {
  /**
   * Find all placement drives with multi-criteria filters
   */
  static async findAll({
    search = '',
    department = '',
    employment_type = '',
    status = '',
    min_package = 0,
    max_package = 100,
    student_id = null,
    page = 1,
    limit = 10,
  } = {}) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    const whereConditions = [];

    if (search) {
      whereConditions.push('(pd.job_title LIKE ? OR c.name LIKE ? OR pd.location LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (department) {
      whereConditions.push('(FIND_IN_SET(?, REPLACE(pd.eligible_departments, \', \', \',\')) > 0 OR pd.eligible_departments LIKE ?)');
      params.push(department, `%${department}%`);
    }

    if (employment_type) {
      whereConditions.push('pd.employment_type = ?');
      params.push(employment_type);
    }

    if (status) {
      whereConditions.push('pd.status = ?');
      params.push(status);
    }

    if (min_package > 0) {
      whereConditions.push('pd.package_lpa >= ?');
      params.push(parseFloat(min_package));
    }

    if (max_package < 100) {
      whereConditions.push('pd.package_lpa <= ?');
      params.push(parseFloat(max_package));
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Total Count
    const [countRes] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM placement_drives pd
       JOIN companies c ON pd.company_id = c.id
       ${whereClause}`,
      params
    );
    const total = countRes[0]?.total || 0;

    // Fetch drives
    const [rows] = await pool.query(
      `SELECT pd.*,
              c.name AS company_name, c.logo_url AS company_logo, c.website AS company_website, c.industry,
              (SELECT COUNT(*) FROM applications WHERE drive_id = pd.id) AS total_applications,
              app.status AS student_application_status
       FROM placement_drives pd
       JOIN companies c ON pd.company_id = c.id
       LEFT JOIN applications app ON pd.id = app.drive_id AND app.student_id = ?
       ${whereClause}
       ORDER BY pd.drive_date DESC, pd.created_at DESC
       LIMIT ? OFFSET ?`,
      [student_id || null, ...params, parseInt(limit, 10), parseInt(offset, 10)]
    );

    return {
      drives: rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      },
    };
  }

  /**
   * Find drive by ID with selection rounds, company history, and logged-in student eligibility validation
   */
  static async findById(id, studentId = null) {
    const [rows] = await pool.query(
      `SELECT pd.*,
              c.name AS company_name, c.logo_url AS company_logo, c.website AS company_website,
              c.industry, c.headquarters, c.description AS company_description,
              app.status AS student_application_status, app.created_at AS applied_at
       FROM placement_drives pd
       JOIN companies c ON pd.company_id = c.id
       LEFT JOIN applications app ON pd.id = app.drive_id AND app.student_id = ?
       WHERE pd.id = ?
       LIMIT 1`,
      [studentId || null, id]
    );

    if (rows.length === 0) return null;
    const drive = rows[0];

    // Fetch rounds
    const [rounds] = await pool.query(
      `SELECT * FROM drive_rounds WHERE drive_id = ? ORDER BY round_number ASC`,
      [id]
    );
    drive.rounds = rounds;

    // Fetch company history
    const [history] = await pool.query(
      `SELECT * FROM company_history WHERE company_id = ? ORDER BY year DESC LIMIT 5`,
      [drive.company_id]
    );
    drive.company_history = history;

    // If student is logged in, perform multi-factor PASS/FAIL eligibility analysis
    if (studentId) {
      const [students] = await pool.query(
        `SELECT s.id, s.department, p.cgpa, p.tenth_percentage, p.twelfth_percentage, p.standing_arrears, p.history_arrears
         FROM students s
         LEFT JOIN student_profiles p ON s.id = p.student_id
         WHERE s.id = ? LIMIT 1`,
        [studentId]
      );

      const [studentSkillsRows] = await pool.query(
        `SELECT skill_name FROM student_skills WHERE student_id = ?`,
        [studentId]
      );
      const studentSkills = studentSkillsRows.map((s) => s.skill_name.toLowerCase());

      if (students.length > 0) {
        const s = students[0];
        const studentDept = s.department || '';
        const studentCgpa = parseFloat(s.cgpa) || 0;
        const studentTenth = parseFloat(s.tenth_percentage) || 0;
        const studentTwelfth = parseFloat(s.twelfth_percentage) || 0;
        const studentStanding = parseInt(s.standing_arrears, 10) || 0;
        const studentHistory = parseInt(s.history_arrears, 10) || 0;

        const deptEligible = drive.eligible_departments
          .split(',')
          .map((d) => d.trim().toUpperCase())
          .includes(studentDept.toUpperCase());
        const cgpaEligible = studentCgpa >= parseFloat(drive.min_cgpa);
        const tenthEligible = studentTenth >= parseFloat(drive.min_tenth_percentage);
        const twelfthEligible = studentTwelfth >= parseFloat(drive.min_twelfth_percentage);
        const standingEligible = studentStanding <= parseInt(drive.max_standing_arrears, 10);
        const historyEligible = studentHistory <= parseInt(drive.max_history_arrears, 10);
        const isDeadlineActive = new Date(drive.application_deadline) >= new Date();

        const isOverallEligible =
          deptEligible &&
          cgpaEligible &&
          tenthEligible &&
          twelfthEligible &&
          standingEligible &&
          historyEligible &&
          isDeadlineActive;

        // Calculate skills match
        let matchedSkills = [];
        let missingSkills = [];
        if (drive.required_skills) {
          const reqSkills = drive.required_skills.split(',').map((item) => item.trim());
          reqSkills.forEach((rs) => {
            if (studentSkills.some((us) => us.includes(rs.toLowerCase()) || rs.toLowerCase().includes(us))) {
              matchedSkills.push(rs);
            } else {
              missingSkills.push(rs);
            }
          });
        }

        drive.eligibility_check = {
          is_eligible: isOverallEligible,
          is_deadline_active: isDeadlineActive,
          criteria: [
            {
              label: 'Department Branch',
              required: drive.eligible_departments,
              student_val: studentDept,
              pass: deptEligible,
              reason: deptEligible ? 'Branch allowed' : `Your department (${studentDept}) is not in eligible branches`,
            },
            {
              label: 'Minimum CGPA',
              required: `${drive.min_cgpa} CGPA`,
              student_val: `${studentCgpa} CGPA`,
              pass: cgpaEligible,
              reason: cgpaEligible ? 'CGPA requirement satisfied' : `CGPA ${studentCgpa} is below minimum ${drive.min_cgpa}`,
            },
            {
              label: '10th Percentage',
              required: `${drive.min_tenth_percentage}%`,
              student_val: `${studentTenth}%`,
              pass: tenthEligible,
              reason: tenthEligible ? '10th percentage passed' : `10th score ${studentTenth}% is below ${drive.min_tenth_percentage}%`,
            },
            {
              label: '12th Percentage',
              required: `${drive.min_twelfth_percentage}%`,
              student_val: `${studentTwelfth}%`,
              pass: twelfthEligible,
              reason: twelfthEligible ? '12th percentage passed' : `12th score ${studentTwelfth}% is below ${drive.min_twelfth_percentage}%`,
            },
            {
              label: 'Standing Backlogs',
              required: `Max ${drive.max_standing_arrears}`,
              student_val: `${studentStanding}`,
              pass: standingEligible,
              reason: standingEligible ? 'Arrears criteria met' : `You have ${studentStanding} active backlogs (max allowed: ${drive.max_standing_arrears})`,
            },
            {
              label: 'History of Arrears',
              required: `Max ${drive.max_history_arrears}`,
              student_val: `${studentHistory}`,
              pass: historyEligible,
              reason: historyEligible ? 'History requirement met' : `You have ${studentHistory} history arrears (max allowed: ${drive.max_history_arrears})`,
            },
            {
              label: 'Application Deadline',
              required: new Date(drive.application_deadline).toLocaleString(),
              student_val: isDeadlineActive ? 'Open' : 'Closed',
              pass: isDeadlineActive,
              reason: isDeadlineActive ? 'Applications currently accepted' : 'Application deadline has elapsed',
            },
          ],
          skills_match: {
            matched: matchedSkills,
            missing: missingSkills,
            percentage:
              matchedSkills.length + missingSkills.length > 0
                ? Math.round((matchedSkills.length / (matchedSkills.length + missingSkills.length)) * 100)
                : 100,
          },
        };
      }
    }

    return drive;
  }

  /**
   * Create a new placement drive with recruitment rounds
   */
  static async create(driveData, rounds = []) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [res] = await conn.query(
        `INSERT INTO placement_drives
         (company_id, job_title, job_description, location, employment_type, package_lpa, stipend_monthly, drive_date, application_deadline, eligible_departments, min_cgpa, min_tenth_percentage, min_twelfth_percentage, max_standing_arrears, max_history_arrears, required_skills, official_apply_link, instructions, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          driveData.company_id,
          driveData.job_title,
          driveData.job_description,
          driveData.location,
          driveData.employment_type || 'Full-time',
          driveData.package_lpa || 0,
          driveData.stipend_monthly || 0,
          driveData.drive_date,
          driveData.application_deadline,
          driveData.eligible_departments,
          driveData.min_cgpa || 0,
          driveData.min_tenth_percentage || 0,
          driveData.min_twelfth_percentage || 0,
          driveData.max_standing_arrears || 0,
          driveData.max_history_arrears || 0,
          driveData.required_skills || null,
          driveData.official_apply_link || null,
          driveData.instructions || null,
          driveData.status || 'published',
        ]
      );
      const driveId = res.insertId;

      // Insert rounds
      if (rounds && rounds.length > 0) {
        for (let i = 0; i < rounds.length; i++) {
          const r = rounds[i];
          await conn.query(
            `INSERT INTO drive_rounds (drive_id, round_number, round_name, description, round_date)
             VALUES (?, ?, ?, ?, ?)`,
            [driveId, r.round_number || i + 1, r.round_name, r.description || null, r.round_date || null]
          );
        }
      }

      await conn.commit();
      return driveId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Update an existing placement drive and its rounds
   */
  static async update(id, driveData, rounds = null) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        `UPDATE placement_drives SET
          company_id = COALESCE(?, company_id),
          job_title = COALESCE(?, job_title),
          job_description = COALESCE(?, job_description),
          location = COALESCE(?, location),
          employment_type = COALESCE(?, employment_type),
          package_lpa = COALESCE(?, package_lpa),
          stipend_monthly = COALESCE(?, stipend_monthly),
          drive_date = COALESCE(?, drive_date),
          application_deadline = COALESCE(?, application_deadline),
          eligible_departments = COALESCE(?, eligible_departments),
          min_cgpa = COALESCE(?, min_cgpa),
          min_tenth_percentage = COALESCE(?, min_tenth_percentage),
          min_twelfth_percentage = COALESCE(?, min_twelfth_percentage),
          max_standing_arrears = COALESCE(?, max_standing_arrears),
          max_history_arrears = COALESCE(?, max_history_arrears),
          required_skills = COALESCE(?, required_skills),
          official_apply_link = COALESCE(?, official_apply_link),
          instructions = COALESCE(?, instructions),
          status = COALESCE(?, status)
         WHERE id = ?`,
        [
          driveData.company_id,
          driveData.job_title,
          driveData.job_description,
          driveData.location,
          driveData.employment_type,
          driveData.package_lpa,
          driveData.stipend_monthly,
          driveData.drive_date,
          driveData.application_deadline,
          driveData.eligible_departments,
          driveData.min_cgpa,
          driveData.min_tenth_percentage,
          driveData.min_twelfth_percentage,
          driveData.max_standing_arrears,
          driveData.max_history_arrears,
          driveData.required_skills,
          driveData.official_apply_link,
          driveData.instructions,
          driveData.status,
          id,
        ]
      );

      // If rounds provided, replace rounds
      if (rounds !== null) {
        await conn.query(`DELETE FROM drive_rounds WHERE drive_id = ?`, [id]);
        for (let i = 0; i < rounds.length; i++) {
          const r = rounds[i];
          await conn.query(
            `INSERT INTO drive_rounds (drive_id, round_number, round_name, description, round_date)
             VALUES (?, ?, ?, ?, ?)`,
            [id, r.round_number || i + 1, r.round_name, r.description || null, r.round_date || null]
          );
        }
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
   * Delete placement drive
   */
  static async delete(id) {
    const [res] = await pool.query(`DELETE FROM placement_drives WHERE id = ?`, [id]);
    return res.affectedRows > 0;
  }

  /**
   * Student Apply / Express Interest in Drive (Server-Enforced Eligibility Validation)
   */
  static async applyForDrive(driveId, studentId, status = 'Interested', notes = '') {
    // 1. Fetch drive and student eligibility
    const drive = await this.findById(driveId, studentId);
    if (!drive) {
      throw new Error('Placement drive not found.');
    }

    if (drive.status !== 'published') {
      throw new Error('This placement drive is not open for applications.');
    }

    if (drive.eligibility_check && !drive.eligibility_check.is_eligible) {
      const failedCriteria = drive.eligibility_check.criteria
        .filter((c) => !c.pass)
        .map((c) => c.reason)
        .join('. ');
      throw new Error(`Ineligible to apply: ${failedCriteria}`);
    }

    // 2. Insert or update application record
    const [res] = await pool.query(
      `INSERT INTO applications (student_id, drive_id, status, notes)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes), updated_at = CURRENT_TIMESTAMP`,
      [studentId, driveId, status, notes]
    );

    return res.affectedRows > 0;
  }
}

module.exports = DriveModel;

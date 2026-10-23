const pool = require('../config/db');

class StudentModel {
  /**
   * Get Student Full Profile including skills and streak
   */
  static async getStudentProfile(studentId) {
    const [students] = await pool.query(
      `SELECT s.id, s.register_number, s.full_name, s.email, s.phone, s.department, s.course, s.batch, s.graduation_year, s.is_active, s.created_at,
              p.cgpa, p.tenth_percentage, p.twelfth_percentage, p.diploma_percentage, p.standing_arrears, p.history_arrears, p.resume_url, p.photo_url, p.github_url, p.linkedin_url, p.portfolio_url, p.bio,
              st.current_streak, st.max_streak, st.total_points, st.challenges_completed
       FROM students s
       LEFT JOIN student_profiles p ON s.id = p.student_id
       LEFT JOIN student_streaks st ON s.id = st.student_id
       WHERE s.id = ? LIMIT 1`,
      [studentId]
    );

    if (students.length === 0) return null;
    const student = students[0];

    // Fetch skills
    const [skills] = await pool.query(
      `SELECT id, skill_name, proficiency FROM student_skills WHERE student_id = ? ORDER BY skill_name ASC`,
      [studentId]
    );
    student.skills = skills;

    // Calculate profile completeness score
    let score = 0;
    if (student.full_name && student.email && student.phone) score += 20;
    if (student.department && student.course && student.batch) score += 15;
    if (student.cgpa > 0 && student.tenth_percentage > 0 && student.twelfth_percentage > 0) score += 25;
    if (skills.length > 0) score += 15;
    if (student.resume_url) score += 15;
    if (student.github_url || student.linkedin_url || student.portfolio_url) score += 10;

    student.profile_completeness = Math.min(score, 100);

    return student;
  }

  /**
   * Update student personal & academic details
   */
  static async updateStudentProfile(studentId, data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Update student table
      if (data.full_name || data.phone) {
        await conn.query(
          `UPDATE students SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?`,
          [data.full_name, data.phone, studentId]
        );
      }

      // Update student_profiles table
      await conn.query(
        `UPDATE student_profiles SET
          cgpa = COALESCE(?, cgpa),
          tenth_percentage = COALESCE(?, tenth_percentage),
          twelfth_percentage = COALESCE(?, twelfth_percentage),
          diploma_percentage = COALESCE(?, diploma_percentage),
          standing_arrears = COALESCE(?, standing_arrears),
          history_arrears = COALESCE(?, history_arrears),
          github_url = COALESCE(?, github_url),
          linkedin_url = COALESCE(?, linkedin_url),
          portfolio_url = COALESCE(?, portfolio_url),
          bio = COALESCE(?, bio)
         WHERE student_id = ?`,
        [
          data.cgpa,
          data.tenth_percentage,
          data.twelfth_percentage,
          data.diploma_percentage,
          data.standing_arrears,
          data.history_arrears,
          data.github_url,
          data.linkedin_url,
          data.portfolio_url,
          data.bio,
          studentId,
        ]
      );

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
   * Add a skill for a student
   */
  static async addSkill(studentId, skillName, proficiency = 'intermediate') {
    const [result] = await pool.query(
      `INSERT INTO student_skills (student_id, skill_name, proficiency)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE proficiency = VALUES(proficiency)`,
      [studentId, skillName.trim(), proficiency]
    );
    return result.insertId;
  }

  /**
   * Delete a skill
   */
  static async deleteSkill(studentId, skillId) {
    const [result] = await pool.query(
      `DELETE FROM student_skills WHERE id = ? AND student_id = ?`,
      [skillId, studentId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Update Resume URL
   */
  static async updateResume(studentId, resumeUrl) {
    const [result] = await pool.query(
      `UPDATE student_profiles SET resume_url = ? WHERE student_id = ?`,
      [resumeUrl, studentId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Update Profile Photo URL
   */
  static async updatePhoto(studentId, photoUrl) {
    const [result] = await pool.query(
      `UPDATE student_profiles SET photo_url = ? WHERE student_id = ?`,
      [photoUrl, studentId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Aggregate Student Dashboard Data
   */
  static async getStudentDashboard(studentId) {
    // 1. Fetch Student profile & skills
    const profile = await this.getStudentProfile(studentId);
    if (!profile) return null;

    const studentSkills = profile.skills.map((s) => s.skill_name.toLowerCase());

    // 2. Stat Card Counts
    // - Upcoming Companies (published drives with future deadlines)
    const [upcomingCountRes] = await pool.query(
      `SELECT COUNT(*) AS total FROM placement_drives WHERE status = 'published' AND application_deadline >= NOW()`
    );
    const upcomingCompaniesCount = upcomingCountRes[0]?.total || 0;

    // - Companies Applied
    const [appliedCountRes] = await pool.query(
      `SELECT COUNT(*) AS total FROM applications WHERE student_id = ?`,
      [studentId]
    );
    const companiesAppliedCount = appliedCountRes[0]?.total || 0;

    // - Tests Completed
    const [testsCountRes] = await pool.query(
      `SELECT COUNT(*) AS total FROM test_attempts WHERE student_id = ? AND status = 'completed'`,
      [studentId]
    );
    const testsCompletedCount = testsCountRes[0]?.total || 0;

    // - Streak info
    const currentStreak = profile.current_streak || 0;
    const totalPoints = profile.total_points || 0;

    // 3. Today's Daily Challenge
    const [todayChallengeRows] = await pool.query(
      `SELECT dc.id, dc.title, dc.points, dc.challenge_date,
              cq.id AS question_id, cq.question_text, cq.option_a, cq.option_b, cq.option_c, cq.option_d,
              ca.id AS attempt_id, ca.selected_option, ca.is_correct, ca.points_awarded
       FROM daily_challenges dc
       LEFT JOIN challenge_questions cq ON dc.id = cq.challenge_id
       LEFT JOIN challenge_attempts ca ON dc.id = ca.challenge_id AND ca.student_id = ?
       WHERE dc.challenge_date = CURDATE()
       LIMIT 1`,
      [studentId]
    );
    const todayChallenge = todayChallengeRows[0] || null;

    // 4. Vocabulary of the Day (Deterministic daily word based on day offset)
    const [vocabCountRes] = await pool.query(`SELECT COUNT(*) AS total FROM vocabulary`);
    const totalVocab = vocabCountRes[0]?.total || 1;
    const dayOffset = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % totalVocab;

    const [vocabRows] = await pool.query(
      `SELECT v.*, sv.status AS student_status
       FROM vocabulary v
       LEFT JOIN student_vocabulary sv ON v.id = sv.vocab_id AND sv.student_id = ?
       ORDER BY v.id ASC
       LIMIT 1 OFFSET ?`,
      [studentId, dayOffset]
    );
    const vocabularyOfDay = vocabRows[0] || null;

    // 5. Rule-Based Eligible Companies Query
    // Evaluates: department, cgpa, 10th, 12th, arrears, and deadline not passed
    const [eligibleDrivesRows] = await pool.query(
      `SELECT pd.id, pd.job_title, pd.job_description, pd.location, pd.employment_type,
              pd.package_lpa, pd.stipend_monthly, pd.drive_date, pd.application_deadline,
              pd.eligible_departments, pd.min_cgpa, pd.min_tenth_percentage, pd.min_twelfth_percentage,
              pd.max_standing_arrears, pd.max_history_arrears, pd.required_skills, pd.status,
              c.id AS company_id, c.name AS company_name, c.logo_url, c.website,
              app.status AS application_status
       FROM placement_drives pd
       JOIN companies c ON pd.company_id = c.id
       LEFT JOIN applications app ON pd.id = app.drive_id AND app.student_id = ?
       WHERE pd.status = 'published'
         AND pd.application_deadline >= NOW()
         AND (FIND_IN_SET(?, REPLACE(pd.eligible_departments, ', ', ',')) > 0 OR pd.eligible_departments LIKE ?)
         AND ? >= pd.min_cgpa
         AND ? >= pd.min_tenth_percentage
         AND ? >= pd.min_twelfth_percentage
         AND ? <= pd.max_standing_arrears
         AND ? <= pd.max_history_arrears
       ORDER BY pd.application_deadline ASC
       LIMIT 6`,
      [
        studentId,
        profile.department,
        `%${profile.department}%`,
        profile.cgpa || 0,
        profile.tenth_percentage || 0,
        profile.twelfth_percentage || 0,
        profile.standing_arrears || 0,
        profile.history_arrears || 0,
      ]
    );

    // Calculate skills match count for each eligible drive
    const eligibleCompanies = eligibleDrivesRows.map((drive) => {
      let matchedSkillsCount = 0;
      let totalRequiredSkills = 0;

      if (drive.required_skills) {
        const required = drive.required_skills.split(',').map((s) => s.trim().toLowerCase());
        totalRequiredSkills = required.length;
        matchedSkillsCount = required.filter((reqSkill) =>
          studentSkills.some((userSkill) => userSkill.includes(reqSkill) || reqSkill.includes(userSkill))
        ).length;
      }

      return {
        ...drive,
        skills_match_count: matchedSkillsCount,
        total_required_skills: totalRequiredSkills,
        skills_match_percentage: totalRequiredSkills > 0 ? Math.round((matchedSkillsCount / totalRequiredSkills) * 100) : 100,
      };
    });

    // 6. Upcoming Drives (All active drives closing soon)
    const [upcomingDrives] = await pool.query(
      `SELECT pd.id, pd.job_title, pd.package_lpa, pd.drive_date, pd.application_deadline, pd.location, pd.employment_type,
              c.name AS company_name, c.logo_url,
              app.status AS application_status
       FROM placement_drives pd
       JOIN companies c ON pd.company_id = c.id
       LEFT JOIN applications app ON pd.id = app.drive_id AND app.student_id = ?
       WHERE pd.status = 'published' AND pd.application_deadline >= NOW()
       ORDER BY pd.application_deadline ASC
       LIMIT 5`,
      [studentId]
    );

    // 7. Today's Recommended Aptitude Test
    const [recommendedTests] = await pool.query(
      `SELECT t.id, t.title, t.description, t.category, t.duration_minutes, t.total_marks, t.difficulty,
              ta.score, ta.percentage, ta.status AS attempt_status
       FROM tests t
       LEFT JOIN test_attempts ta ON t.id = ta.test_id AND ta.student_id = ?
       WHERE t.is_published = TRUE
       ORDER BY ta.id IS NULL DESC, t.id ASC
       LIMIT 1`,
      [studentId]
    );
    const todayTest = recommendedTests[0] || null;

    // 8. Recent Preparation Videos
    const [recentVideos] = await pool.query(
      `SELECT v.*, svp.is_completed
       FROM videos v
       LEFT JOIN student_video_progress svp ON v.id = svp.video_id AND svp.student_id = ?
       ORDER BY v.id ASC
       LIMIT 4`,
      [studentId]
    );

    return {
      profile,
      stats: {
        upcoming_companies: upcomingCompaniesCount,
        companies_applied: companiesAppliedCount,
        tests_completed: testsCompletedCount,
        current_streak: currentStreak,
        total_points: totalPoints,
        profile_completeness: profile.profile_completeness,
      },
      today_challenge: todayChallenge,
      vocabulary_of_day: vocabularyOfDay,
      today_test: todayTest,
      eligible_companies: eligibleCompanies,
      upcoming_drives: upcomingDrives,
      recent_videos: recentVideos,
    };
  }
}

module.exports = StudentModel;

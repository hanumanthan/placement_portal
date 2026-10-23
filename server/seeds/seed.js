const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seed() {
  console.log('🌱 Starting Campus Placement Portal Database Initialization & Seeding...');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    multipleStatements: true,
  });

  try {
    // 1. Ensure database exists
    const dbName = process.env.DB_NAME || 'placement_portal';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);
    console.log(`✅ Using database "${dbName}"`);

    // 2. Read and apply schema
    const schemaPath = path.join(__dirname, '../../database/placement_portal.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      console.log('⏳ Executing schema DDL...');
      await connection.query(schemaSql);
      console.log('✅ Schema tables successfully created (26 tables)');
    }

    // 3. Clear existing seed data if re-seeding
    console.log('⏳ Cleaning existing tables...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    const tables = [
      'notifications', 'resources', 'student_video_progress', 'videos',
      'student_vocabulary', 'vocabulary', 'student_streaks', 'challenge_attempts',
      'challenge_questions', 'daily_challenges', 'test_answers', 'test_attempts',
      'test_questions', 'tests', 'interview_experiences', 'previous_questions',
      'company_history', 'applications', 'drive_rounds', 'placement_drives',
      'companies', 'student_skills', 'student_profiles', 'students', 'admins', 'departments'
    ];
    for (const t of tables) {
      await connection.query(`TRUNCATE TABLE \`${t}\`;`);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    // 4. Seed Departments
    console.log('⏳ Seeding departments...');
    const departments = [
      ['CSE', 'Computer Science and Engineering'],
      ['IT', 'Information Technology'],
      ['AIDS', 'Artificial Intelligence and Data Science'],
      ['ECE', 'Electronics and Communication Engineering'],
      ['EEE', 'Electrical and Electronics Engineering'],
      ['MECH', 'Mechanical Engineering'],
      ['CIVIL', 'Civil Engineering'],
    ];
    for (const [code, name] of departments) {
      await connection.query(
        'INSERT INTO departments (code, name) VALUES (?, ?)',
        [code, name]
      );
    }

    // 5. Seed Admin
    console.log('⏳ Seeding admin account...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@placementportal.com';
    const adminRawPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const hashedAdminPassword = await bcrypt.hash(adminRawPassword, 10);
    await connection.query(
      'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Campus Placement Officer', adminEmail, hashedAdminPassword, 'admin']
    );

    // 6. Seed Demo Students
    console.log('⏳ Seeding demo students & profiles...');
    const demoStudents = [
      {
        regNo: '953621104001',
        name: 'Arun Kumar',
        email: 'arun.kumar@student.edu',
        phone: '9876543210',
        dept: 'CSE',
        cgpa: 8.85,
        tenth: 92.5,
        twelfth: 89.0,
        standingArrears: 0,
        historyArrears: 0,
        skills: ['Java', 'Spring Boot', 'MySQL', 'React', 'Data Structures', 'Docker'],
        bio: 'Aspiring Full Stack Software Engineer passionate about backend systems, distributed architectures, and competitive programming.',
        streak: 14,
        points: 280,
      },
      {
        regNo: '953621104002',
        name: 'Priya Sharma',
        email: 'priya.sharma@student.edu',
        phone: '9876543211',
        dept: 'IT',
        cgpa: 9.15,
        tenth: 95.0,
        twelfth: 93.5,
        standingArrears: 0,
        historyArrears: 0,
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'FastAPI', 'AWS'],
        bio: 'Data Science enthusiast with research experience in applied NLP and automated data pipeline development.',
        streak: 22,
        points: 440,
      },
      {
        regNo: '953621104003',
        name: 'Karthik Raja',
        email: 'karthik.raja@student.edu',
        phone: '9876543212',
        dept: 'ECE',
        cgpa: 7.80,
        tenth: 84.0,
        twelfth: 81.0,
        standingArrears: 0,
        historyArrears: 1,
        skills: ['C++', 'Embedded Systems', 'IoT', 'Python', 'Linux', 'Verilog'],
        bio: 'Hardware-Software co-design enthusiast looking for embedded firmware and systems engineering roles.',
        streak: 5,
        points: 100,
      },
      {
        regNo: '953621104004',
        name: 'Sneha Patel',
        email: 'sneha.patel@student.edu',
        phone: '9876543213',
        dept: 'AIDS',
        cgpa: 8.40,
        tenth: 88.5,
        twelfth: 86.0,
        standingArrears: 0,
        historyArrears: 0,
        skills: ['Python', 'Deep Learning', 'PyTorch', 'Tableau', 'SQL', 'Git'],
        bio: 'AI & Data Science student exploring Generative AI models and big data analytics for high-impact products.',
        streak: 9,
        points: 180,
      },
      {
        regNo: '953621104005',
        name: 'Vignesh Balaji',
        email: 'vignesh.balaji@student.edu',
        phone: '9876543214',
        dept: 'MECH',
        cgpa: 6.95,
        tenth: 78.0,
        twelfth: 74.0,
        standingArrears: 1,
        historyArrears: 2,
        skills: ['AutoCAD', 'SolidWorks', 'ANSYS', 'Python', 'MATLAB'],
        bio: 'Mechanical engineering major transitioning into automotive automation and design analysis.',
        streak: 2,
        points: 40,
      },
      {
        regNo: '953621104006',
        name: 'Ananya Deshmukh',
        email: 'ananya.deshmukh@student.edu',
        phone: '9876543215',
        dept: 'CSE',
        cgpa: 9.40,
        tenth: 96.0,
        twelfth: 95.0,
        standingArrears: 0,
        historyArrears: 0,
        skills: ['Go', 'Kubernetes', 'Cloud Architecture', 'React', 'Node.js', 'PostgreSQL'],
        bio: 'Open source contributor and cloud-native enthusiast. Solved 450+ LeetCode problems.',
        streak: 30,
        points: 620,
      }
    ];

    const studentPasswordHash = await bcrypt.hash('Student@123', 10);
    const studentIds = [];

    for (const s of demoStudents) {
      const [res] = await connection.query(
        `INSERT INTO students (register_number, full_name, email, phone, password, department, course, batch, graduation_year, is_active, role)
         VALUES (?, ?, ?, ?, ?, ?, 'B.Tech', '2021-2025', 2025, TRUE, 'student')`,
        [s.regNo, s.name, s.email, s.phone, studentPasswordHash, s.dept]
      );
      const studentId = res.insertId;
      studentIds.push(studentId);

      // Profile
      await connection.query(
        `INSERT INTO student_profiles (student_id, cgpa, tenth_percentage, twelfth_percentage, standing_arrears, history_arrears, bio, github_url, linkedin_url, portfolio_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          studentId, s.cgpa, s.tenth, s.twelfth, s.standingArrears, s.historyArrears, s.bio,
          `https://github.com/${s.name.toLowerCase().replace(' ', '')}`,
          `https://linkedin.com/in/${s.name.toLowerCase().replace(' ', '')}`,
          `https://${s.name.toLowerCase().replace(' ', '')}.dev`
        ]
      );

      // Skills
      for (const skill of s.skills) {
        await connection.query(
          'INSERT INTO student_skills (student_id, skill_name, proficiency) VALUES (?, ?, ?)',
          [studentId, skill, 'advanced']
        );
      }

      // Streak record
      await connection.query(
        `INSERT INTO student_streaks (student_id, current_streak, max_streak, total_points, challenges_completed, last_activity_date)
         VALUES (?, ?, ?, ?, ?, CURDATE())`,
        [studentId, s.streak, s.streak + 5, s.points, Math.floor(s.points / 20)]
      );
    }

    // 7. Seed Companies
    console.log('⏳ Seeding tier-1 & product companies...');
    const companies = [
      {
        name: 'Tata Consultancy Services (TCS)',
        website: 'https://www.tcs.com',
        industry: 'IT Services & Consulting',
        headquarters: 'Mumbai, Maharashtra',
        description: 'TCS is a global leader in IT services, consulting & business solutions with a vast network of innovation and delivery centers.',
      },
      {
        name: 'Infosys Limited',
        website: 'https://www.infosys.com',
        industry: 'Information Technology',
        headquarters: 'Bengaluru, Karnataka',
        description: 'Infosys is a global leader in next-generation digital services and consulting, enabling clients across 56 countries.',
      },
      {
        name: 'Wipro Technologies',
        website: 'https://www.wipro.com',
        industry: 'IT Services & Business Consulting',
        headquarters: 'Bengaluru, Karnataka',
        description: 'Wipro is a leading technology services and consulting company focused on building innovative solutions addressing digital transformation needs.',
      },
      {
        name: 'Accenture India',
        website: 'https://www.accenture.com',
        industry: 'Management Consulting & Technology Services',
        headquarters: 'Dublin, Ireland / Bengaluru',
        description: 'Accenture is a global professional services company with leading capabilities in digital, cloud, and security.',
      },
      {
        name: 'Cognizant Technology Solutions',
        website: 'https://www.cognizant.com',
        industry: 'Digital, IT & Operations',
        headquarters: 'Teaneck, NJ / Chennai',
        description: 'Cognizant engineers modern businesses, modernizing technologies, reimagining processes and transforming experiences.',
      },
      {
        name: 'Zoho Corporation',
        website: 'https://www.zoho.com',
        industry: 'Cloud Software & SaaS Products',
        headquarters: 'Chennai, Tamil Nadu',
        description: 'Zoho creates elegant enterprise applications to solve business problems with over 100M+ users globally.',
      }
    ];

    const companyIds = {};
    for (const c of companies) {
      const [res] = await connection.query(
        'INSERT INTO companies (name, website, industry, headquarters, description) VALUES (?, ?, ?, ?, ?)',
        [c.name, c.website, c.industry, c.headquarters, c.description]
      );
      companyIds[c.name] = res.insertId;
    }

    // 8. Seed Company History
    console.log('⏳ Seeding historical company recruitment statistics...');
    const historyData = [
      // TCS
      { name: 'Tata Consultancy Services (TCS)', year: 2021, appeared: 320, selected: 110, highest: 7.0, avg: 3.8 },
      { name: 'Tata Consultancy Services (TCS)', year: 2022, appeared: 360, selected: 135, highest: 9.0, avg: 4.0 },
      { name: 'Tata Consultancy Services (TCS)', year: 2023, appeared: 310, selected: 95,  highest: 11.5, avg: 4.2 },
      { name: 'Tata Consultancy Services (TCS)', year: 2024, appeared: 290, selected: 88,  highest: 11.5, avg: 4.5 },
      // Infosys
      { name: 'Infosys Limited', year: 2021, appeared: 280, selected: 90,  highest: 6.5, avg: 3.6 },
      { name: 'Infosys Limited', year: 2022, appeared: 310, selected: 110, highest: 9.5, avg: 4.2 },
      { name: 'Infosys Limited', year: 2023, appeared: 260, selected: 75,  highest: 9.5, avg: 4.4 },
      { name: 'Infosys Limited', year: 2024, appeared: 240, selected: 68,  highest: 10.0, avg: 4.6 },
      // Wipro
      { name: 'Wipro Technologies', year: 2022, appeared: 250, selected: 72, highest: 6.5, avg: 3.5 },
      { name: 'Wipro Technologies', year: 2023, appeared: 220, selected: 58, highest: 7.5, avg: 3.8 },
      { name: 'Wipro Technologies', year: 2024, appeared: 210, selected: 62, highest: 8.5, avg: 4.0 },
      // Accenture
      { name: 'Accenture India', year: 2022, appeared: 340, selected: 120, highest: 8.5, avg: 4.5 },
      { name: 'Accenture India', year: 2023, appeared: 300, selected: 95,  highest: 9.5, avg: 4.8 },
      { name: 'Accenture India', year: 2024, appeared: 310, selected: 105, highest: 12.0, avg: 5.2 },
      // Cognizant
      { name: 'Cognizant Technology Solutions', year: 2022, appeared: 280, selected: 85, highest: 7.0, avg: 4.0 },
      { name: 'Cognizant Technology Solutions', year: 2023, appeared: 270, selected: 80, highest: 8.0, avg: 4.2 },
      { name: 'Cognizant Technology Solutions', year: 2024, appeared: 250, selected: 76, highest: 10.0, avg: 4.5 },
      // Zoho
      { name: 'Zoho Corporation', year: 2021, appeared: 210, selected: 24, highest: 8.5,  avg: 6.5 },
      { name: 'Zoho Corporation', year: 2022, appeared: 240, selected: 32, highest: 10.0, avg: 7.2 },
      { name: 'Zoho Corporation', year: 2023, appeared: 220, selected: 28, highest: 12.5, avg: 7.8 },
      { name: 'Zoho Corporation', year: 2024, appeared: 260, selected: 35, highest: 15.0, avg: 8.4 },
    ];

    for (const h of historyData) {
      await connection.query(
        `INSERT INTO company_history (company_id, year, total_appeared, total_selected, highest_package, average_package)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [companyIds[h.name], h.year, h.appeared, h.selected, h.highest, h.avg]
      );
    }

    // 9. Seed Placement Drives (8+ drives: mix of upcoming & past)
    console.log('⏳ Seeding placement drives & recruitment rounds...');
    const drives = [
      {
        company: 'Zoho Corporation',
        title: 'Member Technical Staff (Software Developer)',
        desc: 'Zoho is looking for passionate problem solvers capable of writing clean, maintainable code. The role involves building full-stack cloud applications, internal frameworks, and backend microservices.',
        location: 'Chennai / Tenkasi, Tamil Nadu',
        type: 'Full-time',
        package: 8.50,
        stipend: 25000,
        driveDate: '2026-10-15',
        deadline: '2026-10-10 23:59:59',
        departments: 'CSE,IT,AIDS,ECE',
        minCgpa: 7.00,
        min10th: 75.0,
        min12th: 75.0,
        maxArrears: 0,
        maxHistArrears: 1,
        skills: 'C, C++, Java, Data Structures, Algorithms, Problem Solving',
        applyLink: 'https://careers.zohocorp.com/apply/mts-freshers-2025',
        instructions: 'Please bring your college ID card, 2 copies of resume, and laptop for hands-on machine coding rounds.',
        status: 'published',
        rounds: [
          { num: 1, name: 'Round 1: General Aptitude & Basic C Programming', desc: 'MCQs on quantitative, verbal, logical and C output debugging (90 mins)' },
          { num: 2, name: 'Round 2: Basic Programming', desc: '5 coding problems focused on loops, arrays, strings and recursion.' },
          { num: 3, name: 'Round 3: Advanced Machine Coding', desc: 'Mini-application development (e.g., Railway Reservation, Banking CLI, Matrix operations).' },
          { num: 4, name: 'Round 4: Technical Interview', desc: 'Deep dive into data structures, time complexity, and system design basics.' },
          { num: 5, name: 'Round 5: HR Interview', desc: 'Cultural fitment, values and package discussion.' }
        ]
      },
      {
        company: 'Tata Consultancy Services (TCS)',
        title: 'TCS Digital Cadre Software Engineer',
        desc: 'TCS Digital offers roles in high-demand next-gen technologies including AI/ML, Cloud Computing, Cybersecurity, and IoT.',
        location: 'Pan India (Bengaluru, Chennai, Hyderabad, Pune)',
        type: 'Full-time',
        package: 7.50,
        stipend: 0,
        driveDate: '2026-10-22',
        deadline: '2026-10-18 23:59:59',
        departments: 'CSE,IT,AIDS,ECE,EEE',
        minCgpa: 7.50,
        min10th: 70.0,
        min12th: 70.0,
        maxArrears: 0,
        maxHistArrears: 0,
        skills: 'Java, Python, DBMS, OS, Data Structures',
        applyLink: 'https://nextstep.tcs.com/campus/#/digital-drive-2025',
        instructions: 'Registration on TCS NextStep portal with CT/DT reference number is mandatory before campus screening.',
        status: 'published',
        rounds: [
          { num: 1, name: 'TCS National Qualifier Test (NQT Digital)', desc: 'Advanced Cognitive & Programming Assessments' },
          { num: 2, name: 'Technical & Coding Interview', desc: 'Live problem solving, OOP concepts, SQL queries' },
          { num: 3, name: 'HR & Managerial Discussion', desc: 'Behavioral and location flexibility verification' }
        ]
      },
      {
        company: 'Infosys Limited',
        title: 'Specialist Programmer (Power Programmer)',
        desc: 'Specialist Programmers at Infosys work on high-complexity algorithmic challenges, distributed cloud architecture, and competitive coding pipelines.',
        location: 'Bengaluru / Hyderabad / Pune',
        type: 'Full-time',
        package: 9.50,
        stipend: 0,
        driveDate: '2026-11-05',
        deadline: '2026-10-30 23:59:59',
        departments: 'CSE,IT,AIDS,ECE',
        minCgpa: 8.00,
        min10th: 80.0,
        min12th: 80.0,
        maxArrears: 0,
        maxHistArrears: 0,
        skills: 'Dynamic Programming, Graph Theory, Java, Python, C++',
        applyLink: 'https://infytq.onwingspan.com/sp-drive-register',
        instructions: 'HackWithInfy qualifiers or direct SP test cleared candidates will be given direct technical interviews.',
        status: 'published',
        rounds: [
          { num: 1, name: 'InfyTQ Assessment / Coding Round', desc: '3 high-difficulty algorithmic challenges (3 hours)' },
          { num: 2, name: 'Technical Interview', desc: 'Core CS subjects, DP, Graphs, Database indexing and concurrency' },
          { num: 3, name: 'Leadership & HR Interview', desc: 'Project architecture review and managerial fit' }
        ]
      },
      {
        company: 'Accenture India',
        title: 'Advanced Application Engineering Analyst',
        desc: 'Design, develop, and configure software applications to meet business process and application requirements.',
        location: 'Bengaluru, Hyderabad, Chennai, Gurugram',
        type: 'Full-time',
        package: 6.50,
        stipend: 0,
        driveDate: '2026-11-12',
        deadline: '2026-11-08 23:59:59',
        departments: 'CSE,IT,AIDS,ECE,EEE,MECH,CIVIL',
        minCgpa: 6.50,
        min10th: 65.0,
        min12th: 65.0,
        maxArrears: 0,
        maxHistArrears: 1,
        skills: 'SQL, Java, Cloud Basics, Critical Thinking',
        applyLink: 'https://indiacampus.accenture.com/register/ase-2025',
        instructions: 'Virtual assessment links will be dispatched directly to verified email addresses.',
        status: 'published',
        rounds: [
          { num: 1, name: 'Cognitive & Technical Assessment', desc: 'English ability, Critical Thinking, Abstract Reasoning, Common Application Tech' },
          { num: 2, name: 'Coding Assessment', desc: '2 coding problems in candidate choice language (45 mins)' },
          { num: 3, name: 'Communication Assessment', desc: 'Automated AI-based verbal assessment' },
          { num: 4, name: 'Interview', desc: 'Integrated Technical + HR Virtual Interview' }
        ]
      },
      {
        company: 'Cognizant Technology Solutions',
        title: 'GenC Elevate Developer',
        desc: 'GenC Elevate engineers create scalable enterprise solutions leveraging modern tech stacks, microservices, and full stack JavaScript/Java.',
        location: 'Coimbatore, Chennai, Bengaluru',
        type: 'Full-time',
        package: 5.40,
        stipend: 0,
        driveDate: '2026-11-20',
        deadline: '2026-11-15 23:59:59',
        departments: 'CSE,IT,AIDS,ECE,EEE',
        minCgpa: 6.80,
        min10th: 60.0,
        min12th: 60.0,
        maxArrears: 0,
        maxHistArrears: 1,
        skills: 'Java, HTML, CSS, JavaScript, SQL',
        applyLink: 'https://cognizant.hirepro.in/genc-elevate-registration',
        instructions: 'Eligible students should complete the Skill-Badge verification prior to drive day.',
        status: 'published',
        rounds: [
          { num: 1, name: 'Skill Assessment', desc: 'Aptitude + Domain technical MCQs' },
          { num: 2, name: 'Coding Challenge', desc: '2 hands-on coding questions' },
          { num: 3, name: 'Technical & HR Discussion', desc: 'Final interview round' }
        ]
      },
      {
        company: 'Wipro Technologies',
        title: 'Turbo Candidate (Software Developer)',
        desc: 'Wipro Turbo is designed for students with premier programming talent to take on complex engineering roles.',
        location: 'Bengaluru / Hyderabad / Chennai',
        type: 'Full-time',
        package: 6.50,
        stipend: 0,
        driveDate: '2026-11-28',
        deadline: '2026-11-22 23:59:59',
        departments: 'CSE,IT,AIDS,ECE',
        minCgpa: 7.00,
        min10th: 70.0,
        min12th: 70.0,
        maxArrears: 0,
        maxHistArrears: 0,
        skills: 'C++, Java, Python, RDBMS',
        applyLink: 'https://careers.wipro.com/elite-turbo-2025',
        instructions: 'Candidates must possess active passport or receipt of passport application.',
        status: 'published',
        rounds: [
          { num: 1, name: 'National Talent Hunt (NTH)', desc: 'Online aptitude, written communication & coding' },
          { num: 2, name: 'Technical Round', desc: 'Problem solving and system architecture basics' },
          { num: 3, name: 'HR Round', desc: 'Verification and onboarding briefing' }
        ]
      },
      {
        company: 'Tata Consultancy Services (TCS)',
        title: 'TCS Ninja Graduate Trainee',
        desc: 'Core software engineering role focusing on enterprise application development, testing, and cloud migrations.',
        location: 'Pan India',
        type: 'Full-time',
        package: 4.20,
        stipend: 0,
        driveDate: '2026-08-10', // Past drive
        deadline: '2026-08-01 23:59:59',
        departments: 'CSE,IT,AIDS,ECE,EEE,MECH,CIVIL',
        minCgpa: 6.00,
        min10th: 60.0,
        min12th: 60.0,
        maxArrears: 1,
        maxHistArrears: 2,
        skills: 'Basics of C/Python, Logical Reasoning, Aptitude',
        applyLink: 'https://nextstep.tcs.com/ninja-past',
        instructions: 'Campus drive completed.',
        status: 'completed',
        rounds: [
          { num: 1, name: 'TCS NQT Ninja Assessment', desc: 'Numerical ability, verbal reasoning and foundation coding' },
          { num: 2, name: 'Interview', desc: 'Technical & HR interview' }
        ]
      },
      {
        company: 'Zoho Corporation',
        title: 'Product Support Engineer & QA',
        desc: 'Focuses on testing complex cloud business suites, reproducing customer bugs, and building test automation suites.',
        location: 'Chennai / Salem',
        type: 'Full-time',
        package: 5.50,
        stipend: 18000,
        driveDate: '2026-08-25', // Past drive
        deadline: '2026-08-18 23:59:59',
        departments: 'CSE,IT,AIDS,ECE,EEE,MECH,CIVIL',
        minCgpa: 6.50,
        min10th: 65.0,
        min12th: 65.0,
        maxArrears: 0,
        maxHistArrears: 1,
        skills: 'Analytical Skills, SQL, Shell Scripting, Networking',
        applyLink: 'https://careers.zohocorp.com/support-past',
        instructions: 'Drive completed.',
        status: 'completed',
        rounds: [
          { num: 1, name: 'Written Aptitude & Logical Reasoning', desc: 'MCQ assessment' },
          { num: 2, name: 'Technical Round', desc: 'Troubleshooting and SQL scenarios' },
          { num: 3, name: 'HR Round', desc: 'Final review' }
        ]
      }
    ];

    const driveIds = [];
    for (const d of drives) {
      const companyId = companyIds[d.company];
      const [res] = await connection.query(
        `INSERT INTO placement_drives
         (company_id, job_title, job_description, location, employment_type, package_lpa, stipend_monthly, drive_date, application_deadline, eligible_departments, min_cgpa, min_tenth_percentage, min_twelfth_percentage, max_standing_arrears, max_history_arrears, required_skills, official_apply_link, instructions, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          companyId, d.title, d.desc, d.location, d.type, d.package, d.stipend,
          d.driveDate, d.deadline, d.departments, d.minCgpa, d.min10th, d.min12th,
          d.maxArrears, d.maxHistArrears, d.skills, d.applyLink, d.instructions, d.status
        ]
      );
      const driveId = res.insertId;
      driveIds.push(driveId);

      // Rounds
      for (const r of d.rounds) {
        await connection.query(
          'INSERT INTO drive_rounds (drive_id, round_number, round_name, description) VALUES (?, ?, ?, ?)',
          [driveId, r.num, r.name, r.desc]
        );
      }
    }

    // 10. Seed Applications
    console.log('⏳ Seeding student drive applications...');
    // Arun Kumar (id 1)
    await connection.query('INSERT INTO applications (student_id, drive_id, status) VALUES (?, ?, ?)', [studentIds[0], driveIds[0], 'Applied']); // Zoho MTS
    await connection.query('INSERT INTO applications (student_id, drive_id, status) VALUES (?, ?, ?)', [studentIds[0], driveIds[1], 'Shortlisted']); // TCS Digital
    await connection.query('INSERT INTO applications (student_id, drive_id, status) VALUES (?, ?, ?)', [studentIds[0], driveIds[6], 'Selected']); // TCS Ninja (past)

    // Priya Sharma (id 2)
    await connection.query('INSERT INTO applications (student_id, drive_id, status) VALUES (?, ?, ?)', [studentIds[1], driveIds[0], 'Interview']); // Zoho MTS
    await connection.query('INSERT INTO applications (student_id, drive_id, status) VALUES (?, ?, ?)', [studentIds[1], driveIds[2], 'Applied']); // Infosys SP
    await connection.query('INSERT INTO applications (student_id, drive_id, status) VALUES (?, ?, ?)', [studentIds[1], driveIds[3], 'Shortlisted']); // Accenture

    // Karthik Raja (id 3)
    await connection.query('INSERT INTO applications (student_id, drive_id, status) VALUES (?, ?, ?)', [studentIds[2], driveIds[1], 'Applied']); // TCS Digital
    await connection.query('INSERT INTO applications (student_id, drive_id, status) VALUES (?, ?, ?)', [studentIds[2], driveIds[3], 'Test Completed']); // Accenture

    // Sneha Patel (id 4)
    await connection.query('INSERT INTO applications (student_id, drive_id, status) VALUES (?, ?, ?)', [studentIds[3], driveIds[0], 'Interested']); // Zoho
    await connection.query('INSERT INTO applications (student_id, drive_id, status) VALUES (?, ?, ?)', [studentIds[3], driveIds[4], 'Shortlisted']); // Cognizant

    // Vignesh Balaji (id 5 - Mech)
    await connection.query('INSERT INTO applications (student_id, drive_id, status) VALUES (?, ?, ?)', [studentIds[4], driveIds[3], 'Applied']); // Accenture
    await connection.query('INSERT INTO applications (student_id, drive_id, status) VALUES (?, ?, ?)', [studentIds[4], driveIds[7], 'Rejected']); // Zoho Support

    // Ananya Deshmukh (id 6)
    await connection.query('INSERT INTO applications (student_id, drive_id, status) VALUES (?, ?, ?)', [studentIds[5], driveIds[0], 'Selected']); // Zoho MTS
    await connection.query('INSERT INTO applications (student_id, drive_id, status) VALUES (?, ?, ?)', [studentIds[5], driveIds[2], 'Interview']); // Infosys SP

    // 11. Seed 40+ Previous Questions
    console.log('⏳ Seeding 40+ company previous questions with explanations...');
    const questions = [
      // Aptitude (10 questions)
      {
        company: 'Tata Consultancy Services (TCS)', year: 2024, category: 'Aptitude', difficulty: 'easy',
        q: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
        options: JSON.stringify(['65 seconds', '89 seconds', '100 seconds', '150 seconds']),
        answer: '89 seconds',
        exp: 'Speed = Distance / Time = 240 / 24 = 10 m/s. Total distance to cross platform = 240 + 650 = 890 m. Time = 890 / 10 = 89 seconds.'
      },
      {
        company: 'Infosys Limited', year: 2024, category: 'Aptitude', difficulty: 'medium',
        q: 'A and B can do a piece of work in 12 days, B and C in 15 days, and C and A in 20 days. How long will A alone take to finish the work?',
        options: JSON.stringify(['30 days', '20 days', '40 days', '24 days']),
        answer: '30 days',
        exp: '2(A + B + C)\'s 1 day work = 1/12 + 1/15 + 1/20 = 12/60 = 1/5. So (A + B + C)\'s 1 day work = 1/10. A alone = (A + B + C) - (B + C) = 1/10 - 1/15 = 1/30. Hence A takes 30 days.'
      },
      {
        company: 'Wipro Technologies', year: 2023, category: 'Aptitude', difficulty: 'easy',
        q: 'The average of 5 consecutive odd numbers is 27. What is the value of the smallest of these numbers?',
        options: JSON.stringify(['21', '23', '25', '27']),
        answer: '23',
        exp: 'The average of 5 consecutive odd numbers is the middle number (3rd number). So the 3rd number is 27. The numbers are 23, 25, 27, 29, 31. Smallest is 23.'
      },
      {
        company: 'Zoho Corporation', year: 2024, category: 'Aptitude', difficulty: 'hard',
        q: 'In a mixture of 60 liters, the ratio of milk and water is 2:1. If this ratio is to be 1:2, then what quantity of water should be further added?',
        options: JSON.stringify(['20 liters', '40 liters', '60 liters', '80 liters']),
        answer: '60 liters',
        exp: 'Initial milk = (2/3) * 60 = 40 L, water = 20 L. For ratio 1:2, milk remains 40 L, so water must become 80 L. Additional water needed = 80 - 20 = 60 liters.'
      },
      {
        company: 'Accenture India', year: 2023, category: 'Aptitude', difficulty: 'medium',
        q: 'A vendor bought toffees at 6 for a rupee. How many for a rupee must he sell to gain 20%?',
        options: JSON.stringify(['3', '4', '5', '6']),
        answer: '5',
        exp: 'CP of 6 toffees = Re 1. SP of 6 toffees = 120% of 1 = Rs 1.20 = Rs 6/5. For Rs 6/5, toffees sold = 6. For Re 1, toffees sold = 6 * (5/6) = 5.'
      },
      {
        company: 'Cognizant Technology Solutions', year: 2024, category: 'Aptitude', difficulty: 'easy',
        q: 'If the simple interest on a sum of money for 2 years at 5% per annum is Rs. 50, what is the compound interest on the same at the same rate and for the same time?',
        options: JSON.stringify(['Rs. 51.25', 'Rs. 52.00', 'Rs. 54.50', 'Rs. 55.00']),
        answer: 'Rs. 51.25',
        exp: 'Sum = (SI * 100) / (R * T) = (50 * 100) / (5 * 2) = Rs. 500. CI = 500 * [(1 + 5/100)^2 - 1] = 500 * (441/400 - 1) = 500 * 41/400 = Rs. 51.25.'
      },
      {
        company: 'Tata Consultancy Services (TCS)', year: 2023, category: 'Aptitude', difficulty: 'medium',
        q: 'A pipe can fill a tank in 15 hours. Due to a leak in the bottom, it is filled in 20 hours. If the tank is full, how much time will the leak take to empty it?',
        options: JSON.stringify(['40 hours', '50 hours', '60 hours', '75 hours']),
        answer: '60 hours',
        exp: 'Work done by the leak in 1 hour = (1/15 - 1/20) = (4 - 3)/60 = 1/60. Hence, the leak will empty the tank in 60 hours.'
      },
      {
        company: 'Infosys Limited', year: 2023, category: 'Aptitude', difficulty: 'hard',
        q: 'Two dice are tossed once. What is the probability of getting an even number on the first die or a total of 8?',
        options: JSON.stringify(['5/9', '7/12', '1/2', '19/36']),
        answer: '5/9',
        exp: 'Total outcomes = 36. Event A (first die even): 18 outcomes. Event B (sum is 8): {(2,6), (3,5), (4,4), (5,3), (6,2)} (5 outcomes). A ∩ B = {(2,6), (4,4), (6,2)} (3 outcomes). P(A ∪ B) = (18 + 5 - 3)/36 = 20/36 = 5/9.'
      },
      {
        company: 'Wipro Technologies', year: 2024, category: 'Aptitude', difficulty: 'easy',
        q: 'What is 15% of 40% of 1500?',
        options: JSON.stringify(['60', '90', '120', '150']),
        answer: '90',
        exp: '40% of 1500 = 600. 15% of 600 = 90.'
      },
      {
        company: 'Zoho Corporation', year: 2023, category: 'Aptitude', difficulty: 'medium',
        q: 'A clock is started at noon. By 10 minutes past 5, through how many degrees has the hour hand turned?',
        options: JSON.stringify(['145°', '150°', '155°', '160°']),
        answer: '155°',
        exp: 'Hour hand turns 360° in 12 hours = 30° per hour = 0.5° per minute. From 12:00 to 5:10 is 310 minutes. Degrees = 310 * 0.5° = 155°.'
      },

      // Technical (10 questions)
      {
        company: 'Zoho Corporation', year: 2024, category: 'Technical', difficulty: 'medium',
        q: 'What is the output of the following C code snippet?\nint a = 5;\nprintf("%d %d %d", a++, a, ++a);',
        options: JSON.stringify(['5 6 7', 'Compiler dependent / Undefined behavior', '7 6 7', '6 6 7']),
        answer: 'Compiler dependent / Undefined behavior',
        exp: 'Modifying a variable multiple times without a sequence point between modifications leads to Undefined Behavior in the C standard.'
      },
      {
        company: 'Tata Consultancy Services (TCS)', year: 2024, category: 'Technical', difficulty: 'easy',
        q: 'Which data structure is primarily used for implementing Breadth First Search (BFS) in a graph?',
        options: JSON.stringify(['Stack', 'Queue', 'Priority Queue', 'Binary Search Tree']),
        answer: 'Queue',
        exp: 'BFS visits vertices in level-order traversal, requiring a FIFO (First In First Out) structure, which is provided by a Queue.'
      },
      {
        company: 'Infosys Limited', year: 2024, category: 'Technical', difficulty: 'medium',
        q: 'Which normal form deals with the concept of Multivalued Dependency?',
        options: JSON.stringify(['1NF', '2NF', '3NF', '4NF']),
        answer: '4NF',
        exp: 'Fourth Normal Form (4NF) requires that a table is in BCNF and contains no non-trivial multivalued dependencies.'
      },
      {
        company: 'Accenture India', year: 2024, category: 'Technical', difficulty: 'easy',
        q: 'In Object Oriented Programming, which concept refers to the ability to take more than one form?',
        options: JSON.stringify(['Inheritance', 'Encapsulation', 'Polymorphism', 'Abstraction']),
        answer: 'Polymorphism',
        exp: 'Polymorphism allows methods or operators to perform different tasks based on the object calling them (overloading and overriding).'
      },
      {
        company: 'Cognizant Technology Solutions', year: 2023, category: 'Technical', difficulty: 'medium',
        q: 'Which page replacement algorithm suffers from Belady\'s Anomaly?',
        options: JSON.stringify(['FIFO (First In First Out)', 'LRU (Least Recently Used)', 'Optimal Replacement', 'LFU (Least Frequently Used)']),
        answer: 'FIFO (First In First Out)',
        exp: 'Belady\'s Anomaly is the phenomenon where increasing the number of page frames causes an increase in the number of page faults for certain access patterns under FIFO.'
      },
      {
        company: 'Wipro Technologies', year: 2024, category: 'Technical', difficulty: 'easy',
        q: 'What is the worst-case time complexity of QuickSort?',
        options: JSON.stringify(['O(N log N)', 'O(N)', 'O(N^2)', 'O(log N)']),
        answer: 'O(N^2)',
        exp: 'QuickSort has a worst-case time complexity of O(N^2) when the chosen pivot is always the smallest or largest element (e.g. on already sorted arrays without randomized pivot).'
      },
      {
        company: 'Zoho Corporation', year: 2023, category: 'Technical', difficulty: 'hard',
        q: 'In Java, what happens when an overridden method in a child class throws a broader checked exception than the parent method?',
        options: JSON.stringify(['It compiles successfully', 'Compile-time error: overridden method does not throw Exception', 'Runtime Exception', 'Warning only']),
        answer: 'Compile-time error: overridden method does not throw Exception',
        exp: 'In Java, an overriding method cannot declare broader or new checked exceptions than the method it overrides.'
      },
      {
        company: 'Infosys Limited', year: 2023, category: 'Technical', difficulty: 'medium',
        q: 'Which HTTP method is considered idempotent?',
        options: JSON.stringify(['POST', 'PUT', 'PATCH', 'CONNECT']),
        answer: 'PUT',
        exp: 'PUT is idempotent because multiple identical requests will result in the same state on the server as a single request.'
      },
      {
        company: 'Tata Consultancy Services (TCS)', year: 2023, category: 'Technical', difficulty: 'easy',
        q: 'What does ACID stand for in the context of DBMS transactions?',
        options: JSON.stringify([
          'Atomicity, Consistency, Isolation, Durability',
          'Access, Control, Integrity, Data',
          'Authentication, Concurrency, Indexing, Delivery',
          'Automatic, Continuous, Independent, Direct'
        ]),
        answer: 'Atomicity, Consistency, Isolation, Durability',
        exp: 'ACID guarantees database transaction reliability: Atomicity, Consistency, Isolation, and Durability.'
      },
      {
        company: 'Accenture India', year: 2023, category: 'Technical', difficulty: 'medium',
        q: 'What is the default subnet mask for a Class C IP address?',
        options: JSON.stringify(['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.255']),
        answer: '255.255.255.0',
        exp: 'Class C networks use the first 24 bits for the network ID and the remaining 8 bits for host ID, resulting in 255.255.255.0 (/24).'
      },

      // Verbal (10 questions)
      {
        company: 'Tata Consultancy Services (TCS)', year: 2024, category: 'Verbal', difficulty: 'easy',
        q: 'Choose the word nearest in meaning to: CANDID',
        options: JSON.stringify(['Dishonest', 'Secretive', 'Frank / Outspoken', 'Shy']),
        answer: 'Frank / Outspoken',
        exp: 'Candid means truthful, straightforward, and outspoken.'
      },
      {
        company: 'Infosys Limited', year: 2024, category: 'Verbal', difficulty: 'medium',
        q: 'Identify the error in the sentence: "Neither of the two candidates who applied (A) / for the research role (B) / have cleared the initial round (C) / No error (D)"',
        options: JSON.stringify(['A', 'B', 'C', 'D']),
        answer: 'C',
        exp: '"Neither" is singular and takes a singular verb. "have cleared" should be "has cleared".'
      },
      {
        company: 'Accenture India', year: 2024, category: 'Verbal', difficulty: 'easy',
        q: 'Fill in the blank: "She is proficient ______ three programming languages."',
        options: JSON.stringify(['at', 'in', 'with', 'on']),
        answer: 'in',
        exp: 'The correct preposition to follow the adjective "proficient" when referring to a field or subject is "in".'
      },
      {
        company: 'Zoho Corporation', year: 2024, category: 'Verbal', difficulty: 'medium',
        q: 'What is the antonym of the word: EPHEMERAL?',
        options: JSON.stringify(['Transient', 'Eternal / Permanent', 'Fleeting', 'Fragile']),
        answer: 'Eternal / Permanent',
        exp: 'Ephemeral means lasting for a very short time; therefore, its antonym is eternal or permanent.'
      },
      {
        company: 'Wipro Technologies', year: 2023, category: 'Verbal', difficulty: 'easy',
        q: 'Select the correctly spelled word:',
        options: JSON.stringify(['Accomodate', 'Accommodate', 'Acommodate', 'Accommodat']),
        answer: 'Accommodate',
        exp: '"Accommodate" has double \'c\' and double \'m\'.'
      },
      {
        company: 'Cognizant Technology Solutions', year: 2024, category: 'Verbal', difficulty: 'medium',
        q: 'What is the meaning of the idiom: "Burn the midnight oil"?',
        options: JSON.stringify(['Waste precious resources', 'Work or study late into the night', 'Create unnecessary trouble', 'Cook a midnight meal']),
        answer: 'Work or study late into the night',
        exp: '"Burn the midnight oil" means to study or work hard late into the night.'
      },
      {
        company: 'Tata Consultancy Services (TCS)', year: 2023, category: 'Verbal', difficulty: 'easy',
        q: 'Select the synonym for: BENEVOLENT',
        options: JSON.stringify(['Cruel', 'Generous / Kind', 'Selfish', 'Lazy']),
        answer: 'Generous / Kind',
        exp: 'Benevolent means well-meaning, kindly, and charitable.'
      },
      {
        company: 'Infosys Limited', year: 2023, category: 'Verbal', difficulty: 'medium',
        q: 'Fill in the blank: "The committee reached ______ unanimous decision after four hours of debate."',
        options: JSON.stringify(['a', 'an', 'the', 'no article needed']),
        answer: 'a',
        exp: 'Although "unanimous" begins with vowel letter \'u\', it begins with the consonant sound /j/ ("yu-nanimous"), so the article "a" is used.'
      },
      {
        company: 'Accenture India', year: 2023, category: 'Verbal', difficulty: 'hard',
        q: 'Which word describes a person who is indifferent to pleasure or pain?',
        options: JSON.stringify(['Altruist', 'Hedonist', 'Stoic', 'Epicurean']),
        answer: 'Stoic',
        exp: 'A stoic is a person who can endure pain or hardship without showing their feelings or complaining.'
      },
      {
        company: 'Zoho Corporation', year: 2023, category: 'Verbal', difficulty: 'medium',
        q: 'Change into passive voice: "The chef cooked a delicious meal for the guests."',
        options: JSON.stringify([
          'A delicious meal was cooked by the chef for the guests.',
          'A delicious meal had been cooked by the chef.',
          'The guests were cooked a meal by the chef.',
          'A meal is cooked delicious by the chef.'
        ]),
        answer: 'A delicious meal was cooked by the chef for the guests.',
        exp: 'In simple past tense passive voice: Object ("A delicious meal") + was/were + V3 ("cooked") + by agent + rest of sentence.'
      },

      // Coding / Logical (10 questions)
      {
        company: 'Zoho Corporation', year: 2024, category: 'Coding', difficulty: 'hard',
        q: 'Given an array of integers, how would you find the equilibrium index where the sum of lower indices equals the sum of higher indices in O(N) time and O(1) space?',
        options: JSON.stringify([
          'Compute total sum first, then iterate maintaining left sum and checking right sum as (total - left - current)',
          'Sort array first and run two pointers from both sides',
          'Use two nested loops comparing subarray sums at each index',
          'Push all elements to a stack and pop one by one'
        ]),
        answer: 'Compute total sum first, then iterate maintaining left sum and checking right sum as (total - left - current)',
        exp: 'Total sum takes O(N) time. In the second pass, right_sum = total_sum - left_sum - arr[i]. If left_sum == right_sum, index is equilibrium.'
      },
      {
        company: 'Infosys Limited', year: 2024, category: 'Coding', difficulty: 'medium',
        q: 'What is the time complexity to detect a cycle in a linked list using Floyd\'s Cycle Detection (Tortoise and Hare) algorithm?',
        options: JSON.stringify(['O(N^2)', 'O(N)', 'O(log N)', 'O(1)']),
        answer: 'O(N)',
        exp: 'The fast pointer travels at 2x speed and meets the slow pointer in at most N steps inside the loop, yielding O(N) time and O(1) auxiliary space.'
      },
      {
        company: 'Tata Consultancy Services (TCS)', year: 2024, category: 'Logical Reasoning', difficulty: 'easy',
        q: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?',
        options: JSON.stringify(['(1/3)', '(1/8)', '(2/8)', '(1/16)']),
        answer: '(1/8)',
        exp: 'This is a geometric progression where each term is multiplied by 1/2. Next term is (1/4) * (1/2) = (1/8).'
      },
      {
        company: 'Accenture India', year: 2024, category: 'Logical Reasoning', difficulty: 'medium',
        q: 'Pointing to a photograph, a man said, "I have no brother or sister, but that man\'s father is my father\'s son." Whose photograph was it?',
        options: JSON.stringify(['His own', 'His son\'s', 'His father\'s', 'His nephew\'s']),
        answer: 'His son\'s',
        exp: 'Since the speaker has no brother or sister, "my father\'s son" is the speaker himself. Thus, "that man\'s father is me", meaning the photo is of his son.'
      },
      {
        company: 'Cognizant Technology Solutions', year: 2024, category: 'Coding', difficulty: 'medium',
        q: 'Which technique is used to solve the 0/1 Knapsack Problem with integer weights optimally?',
        options: JSON.stringify(['Greedy Algorithm', 'Dynamic Programming', 'Divide and Conquer', 'Linear Search']),
        answer: 'Dynamic Programming',
        exp: '0/1 Knapsack exhibits overlapping subproblems and optimal substructure; greedy fails because items cannot be fractioned, so DP is required.'
      },
      {
        company: 'Wipro Technologies', year: 2023, category: 'Logical Reasoning', difficulty: 'easy',
        q: 'If South-East becomes North, North-East becomes West and so on. What will West become?',
        options: JSON.stringify(['North-East', 'South-East', 'North-West', 'South-West']),
        answer: 'South-East',
        exp: 'Each direction is rotated 135° anti-clockwise. Rotating West 135° anti-clockwise leads to South-East.'
      },
      {
        company: 'Zoho Corporation', year: 2023, category: 'Coding', difficulty: 'hard',
        q: 'How can you swap two integers without using a temporary third variable or arithmetic operations?',
        options: JSON.stringify([
          'Bitwise XOR: a = a ^ b; b = a ^ b; a = a ^ b;',
          'Bitwise AND: a = a & b; b = a & b;',
          'Bitwise OR: a = a | b; b = a | b;',
          'Not possible without arithmetic or temporary variable'
        ]),
        answer: 'Bitwise XOR: a = a ^ b; b = a ^ b; a = a ^ b;',
        exp: 'XOR properties: x ^ x = 0 and x ^ 0 = x. Applying three XOR operations swaps the numbers without risk of integer overflow.'
      },
      {
        company: 'Tata Consultancy Services (TCS)', year: 2023, category: 'Coding', difficulty: 'medium',
        q: 'What is the recurrence relation for the Merge Sort algorithm on an array of size N?',
        options: JSON.stringify(['T(N) = 2T(N/2) + O(N)', 'T(N) = T(N-1) + O(N)', 'T(N) = 2T(N/2) + O(1)', 'T(N) = 4T(N/2) + O(N^2)']),
        answer: 'T(N) = 2T(N/2) + O(N)',
        exp: 'Merge sort divides array into two halves (2T(N/2)) and then merges the sorted halves in linear time (O(N)). Master theorem gives O(N log N).'
      },
      {
        company: 'Infosys Limited', year: 2023, category: 'Logical Reasoning', difficulty: 'medium',
        q: 'Statements: All mangoes are golden in color. No golden-colored things are cheap. Conclusions: 1) All mangoes are cheap. 2) Golden-colored mangoes are not cheap.',
        options: JSON.stringify(['Only conclusion 1 follows', 'Only conclusion 2 follows', 'Either 1 or 2 follows', 'Neither follows']),
        answer: 'Only conclusion 2 follows',
        exp: 'Since all mangoes are golden, and no golden things are cheap, it follows directly that all mangoes (which are golden) are not cheap. Conclusion 2 is valid.'
      },
      {
        company: 'Accenture India', year: 2023, category: 'Coding', difficulty: 'easy',
        q: 'Which string algorithm is best suited for single pattern searching with O(N + M) worst case time complexity?',
        options: JSON.stringify(['Knuth-Morris-Pratt (KMP) Algorithm', 'Brute Force Search', 'Binary Search', 'Bubble Match']),
        answer: 'Knuth-Morris-Pratt (KMP) Algorithm',
        exp: 'KMP pre-computes an LPS (Longest Prefix which is also Suffix) array in O(M) time and searches text in O(N) time with no backtracking.'
      }
    ];

    for (const q of questions) {
      const compId = q.company ? companyIds[q.company] : null;
      await connection.query(
        `INSERT INTO previous_questions (company_id, year, category, difficulty, question_text, options, correct_answer, explanation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [compId, q.year, q.category, q.difficulty, q.q, q.options, q.answer, q.exp]
      );
    }

    // 12. Seed 3 Full Tests + Questions
    console.log('⏳ Seeding 3 aptitude practice tests with questions...');
    const testsData = [
      {
        title: 'TCS NQT Foundation Aptitude Mock Test',
        desc: 'Comprehensive quantitative and analytical aptitude assessment simulating the latest TCS National Qualifier Test pattern.',
        category: 'Quantitative Aptitude',
        duration: 30,
        marks: 10,
        passPercent: 60.0,
        difficulty: 'medium',
        questions: [
          { q: 'A car covers a distance of 450 km in 6 hours. What is its speed in meters per second?', a: '20.83 m/s', b: '25 m/s', c: '75 m/s', d: '12.5 m/s', correct: 'A', marks: 1, exp: 'Speed = 450/6 = 75 km/h. In m/s = 75 * (5/18) = 20.83 m/s.' },
          { q: 'Find the greatest number that will divide 43, 91 and 183 so as to leave the same remainder in each case.', a: '4', b: '7', c: '9', d: '13', correct: 'A', marks: 1, exp: 'HCF of (91-43), (183-91), (183-43) = HCF(48, 92, 140) = 4.' },
          { q: 'If 20% of a = b, then b% of 20 is the same as:', a: '4% of a', b: '5% of a', c: '20% of a', d: 'None of these', correct: 'A', marks: 1, exp: 'b = 0.2a. b% of 20 = (0.2a / 100) * 20 = 4a / 100 = 4% of a.' },
          { q: 'In how many ways can the letters of the word "LEADER" be arranged?', a: '72', b: '144', c: '360', d: '720', correct: 'C', marks: 1, exp: '"LEADER" has 6 letters with E repeated twice. Ways = 6! / 2! = 720 / 2 = 360.' },
          { q: 'A sum of money doubles itself in 10 years at simple interest. What is the rate percentage per annum?', a: '5%', b: '10%', c: '12.5%', d: '15%', correct: 'B', marks: 1, exp: 'SI = P. SI = (P * R * T)/100 => P = (P * R * 10)/100 => R = 10%.' },
          { q: 'The ratio of ages of two friends is 3:5. After 5 years, the ratio becomes 2:3. What is the present age of the elder friend?', a: '25 years', b: '20 years', c: '15 years', d: '30 years', correct: 'A', marks: 1, exp: '(3x + 5)/(5x + 5) = 2/3 => 9x + 15 = 10x + 10 => x = 5. Elder = 5x = 25 years.' },
          { q: 'Find the odd man out: 3, 5, 11, 14, 17, 21', a: '14', b: '21', c: '11', d: '3', correct: 'A', marks: 1, exp: 'All numbers are odd except 14, which is the only even number.' },
          { q: 'A man buys a cycle for Rs. 1400 and sells it at a loss of 15%. What is the selling price of the cycle?', a: 'Rs. 1090', b: 'Rs. 1160', c: 'Rs. 1190', d: 'Rs. 1202', correct: 'C', marks: 1, exp: 'SP = 85% of 1400 = (85/100) * 1400 = Rs. 1190.' },
          { q: 'A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is:', a: '7/15', b: '8/15', c: '1/2', d: '1/3', correct: 'B', marks: 1, exp: 'In 1 day, (A+B) = 1/15 + 1/20 = 7/60. In 4 days = 28/60 = 7/15. Left = 1 - 7/15 = 8/15.' },
          { q: 'The diagonal of a square is 4√2 cm. What is the area of the square?', a: '8 sq. cm', b: '16 sq. cm', c: '32 sq. cm', d: '64 sq. cm', correct: 'B', marks: 1, exp: 'Side * √2 = 4√2 => Side = 4 cm. Area = 4^2 = 16 sq. cm.' },
        ]
      },
      {
        title: 'Core Computer Science & Programming Assessment',
        desc: 'Evaluates fundamental knowledge in Data Structures, Algorithms, DBMS, Operating Systems and Computer Networks.',
        category: 'Technical Core',
        duration: 25,
        marks: 10,
        passPercent: 60.0,
        difficulty: 'medium',
        questions: [
          { q: 'Which data structure is best suited for implementing an LRU Cache?', a: 'Array and Stack', b: 'Hash Map and Doubly Linked List', c: 'Binary Heap', d: 'Queue and Array', correct: 'B', marks: 1, exp: 'Hash Map provides O(1) key lookups, while Doubly Linked List enables O(1) removal and insertion at head.' },
          { q: 'What is the primary objective of Database Normalization?', a: 'Increase redundancy', b: 'Eliminate anomalies and minimize redundancy', c: 'Speed up all join operations', d: 'Enforce table partitioning', correct: 'B', marks: 1, exp: 'Normalization organizes attributes into relations to reduce insertion, deletion, and update anomalies while eliminating duplicate data.' },
          { q: 'In Operating Systems, what are the four necessary conditions for a Deadlock?', a: 'Mutual exclusion, Hold and wait, No preemption, Circular wait', b: 'Swapping, Paging, Segmentation, Thrashing', c: 'Race condition, Critical section, Semaphore, Mutex', d: 'Read, Write, Execute, Delete', correct: 'A', marks: 1, exp: 'Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait must simultaneously hold for deadlock.' },
          { q: 'What layer of the OSI model does the TCP protocol operate on?', a: 'Network Layer', b: 'Transport Layer', c: 'Session Layer', d: 'Data Link Layer', correct: 'B', marks: 1, exp: 'TCP (Transmission Control Protocol) is a connection-oriented Transport Layer (Layer 4) protocol.' },
          { q: 'What is the time complexity to search for an element in a balanced Binary Search Tree (AVL / Red-Black)?', a: 'O(1)', b: 'O(log N)', c: 'O(N)', d: 'O(N log N)', correct: 'B', marks: 1, exp: 'Because balanced BSTs maintain height proportional to log2(N), search runs in O(log N) worst-case time.' },
          { q: 'In SQL, which clause is used to filter records resulting from an aggregate GROUP BY query?', a: 'WHERE', b: 'ORDER BY', c: 'HAVING', d: 'LIMIT', correct: 'C', marks: 1, exp: 'HAVING applies condition filtering on grouped rows after aggregation, whereas WHERE filters individual rows before grouping.' },
          { q: 'What is the function of the ARP (Address Resolution Protocol)?', a: 'Map Domain Names to IP Addresses', b: 'Map IP Addresses to MAC (Hardware) Addresses', c: 'Secure Transport Layer data', d: 'Assign dynamic IP addresses', correct: 'B', marks: 1, exp: 'ARP resolves known IP layer addresses to underlying Ethernet MAC physical addresses.' },
          { q: 'Which sorting algorithm is guaranteed to be stable and run in O(N log N) worst-case time?', a: 'QuickSort', b: 'HeapSort', c: 'MergeSort', d: 'SelectionSort', correct: 'C', marks: 1, exp: 'MergeSort is stable and guarantees O(N log N) in all cases (worst, average, and best).' },
          { q: 'What is Thrashing in Virtual Memory management?', a: 'CPU executes instructions at peak frequency', b: 'System spends more time swapping pages than executing user processes', c: 'A process is killed due to memory limits', d: 'Disk defragmentation is underway', correct: 'B', marks: 1, exp: 'Thrashing occurs when high page fault frequency causes the OS to continuously swap pages between RAM and disk.' },
          { q: 'In Git, what does `git merge --squash` do?', a: 'Deletes all commit history on main branch', b: 'Combines all feature branch commits into a single staged commit', c: 'Reverts the last 5 commits', d: 'Force pushes changes to origin', correct: 'B', marks: 1, exp: 'Squash merge takes all commits from the source branch and produces a single unified changeset on the destination branch.' },
        ]
      },
      {
        title: 'Verbal Ability & Professional Communication Test',
        desc: 'Assesses vocabulary, reading comprehension, grammar rules, error spotting, and sentence correction skills.',
        category: 'Verbal Ability',
        duration: 20,
        marks: 10,
        passPercent: 60.0,
        difficulty: 'easy',
        questions: [
          { q: 'Choose the word that is opposite in meaning to "PRAGMATIC":', a: 'Practical', b: 'Idealistic / Unrealistic', c: 'Sensible', d: 'Hardworking', correct: 'B', marks: 1, exp: 'Pragmatic means dealing with things sensibly and realistically; its opposite is idealistic.' },
          { q: 'Choose the correct passive form: "The manager approved our project proposal."', a: 'Our project proposal is approved by the manager.', b: 'Our project proposal was approved by the manager.', c: 'Our project proposal has been approved.', d: 'Our project proposal had approved the manager.', correct: 'B', marks: 1, exp: 'Simple past passive requires was/were + past participle: "was approved".' },
          { q: 'Select the synonym for "TENACIOUS":', a: 'Weak', b: 'Persistent / Determined', c: 'Hesitant', d: 'Gentle', correct: 'B', marks: 1, exp: 'Tenacious means holding fast, persistent, and determined.' },
          { q: 'Complete the sentence: "Despite ______ tired, she continued to prepare for the test."', a: 'she was', b: 'being', c: 'of being', d: 'having', correct: 'B', marks: 1, exp: '"Despite" is a preposition and must be followed by a noun or gerund ("being").' },
          { q: 'Identify the wrongly spelled word:', a: 'Supercede', b: 'Maintenance', c: 'Privilege', d: 'Conscientious', correct: 'A', marks: 1, exp: 'The correct spelling is "Supersede" with an \'s\'.' },
          { q: 'What does the idiom "A blessing in disguise" mean?', a: 'A gift wrapped secretly', b: 'Something good that seemed bad at first', c: 'A prayer that went unanswered', d: 'A dishonest compliment', correct: 'B', marks: 1, exp: 'A blessing in disguise is an apparent misfortune that eventually results in good.' },
          { q: 'Fill in the blank: "Neither the teacher nor the students ______ present in the lab."', a: 'was', b: 'were', c: 'is', d: 'are not', correct: 'B', marks: 1, exp: 'In "neither...nor", the verb agrees with the closer subject ("students", plural), so "were" is correct in past tense.' },
          { q: 'Select the word that best fits: "A doctor who specializes in skin diseases is a ______."', a: 'Cardiologist', b: 'Dermatologist', c: 'Neurologist', d: 'Pediatrician', correct: 'B', marks: 1, exp: 'Dermatologists specialize in diagnosis and treatment of skin conditions.' },
          { q: 'Fill in the preposition: "He is senior ______ me by two years."', a: 'than', b: 'to', c: 'from', d: 'with', correct: 'B', marks: 1, exp: 'Adjectives ending in -ior (senior, junior, superior, inferior) are followed by "to", not "than".' },
          { q: 'Choose the correct word: "The ______ of the pandemic was felt across all industries."', a: 'Affect', b: 'Effect', c: 'Affective', d: 'Effecting', correct: 'B', marks: 1, exp: '"Effect" is the noun meaning a change or result; "affect" is typically a verb.' },
        ]
      }
    ];

    for (const t of testsData) {
      const [res] = await connection.query(
        `INSERT INTO tests (title, description, category, duration_minutes, total_marks, pass_percentage, difficulty, max_attempts, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, TRUE)`,
        [t.title, t.desc, t.category, t.duration, t.marks, t.passPercent, t.difficulty]
      );
      const testId = res.insertId;

      for (const q of t.questions) {
        await connection.query(
          `INSERT INTO test_questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, category, explanation)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [testId, q.q, q.a, q.b, q.c, q.d, q.correct, q.marks, t.category, q.exp]
        );
      }
    }

    // 13. Seed Daily Challenges + Questions
    console.log('⏳ Seeding active daily challenge...');
    const [challengeRes] = await connection.query(
      `INSERT INTO daily_challenges (challenge_date, title, points)
       VALUES (CURDATE(), 'Today\\'s Algorithmic Challenge: Array Inversions & Bitwise', 15)
       ON DUPLICATE KEY UPDATE title = VALUES(title)`
    );
    const challengeId = challengeRes.insertId || 1;

    // Challenge question
    await connection.query(
      `INSERT INTO challenge_questions (challenge_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        challengeId,
        'What is the result of the bitwise expression `(x & (x - 1))` for any positive integer `x`?',
        'Multiplies x by 2',
        'Clears the lowest set bit in x',
        'Sets all bits to 1',
        'Inverts all odd bits',
        'B',
        '`(x & (x - 1))` is a classic bit manipulation trick that unsets (clears) the rightmost set bit in binary representation of x.'
      ]
    );

    // 14. Seed 30 Vocabulary Words
    console.log('⏳ Seeding 30 high-frequency placement vocabulary words...');
    const vocabList = [
      { word: 'Pragmatic', pron: '/præɡˈmætɪk/', pos: 'Adjective', def: 'Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.', ex: 'The engineering team took a pragmatic approach to meet the tight deadline.', syn: 'Practical, sensible, down-to-earth', ant: 'Idealistic, impractical', diff: 'medium' },
      { word: 'Mitigate', pron: '/ˈmɪtɪɡeɪt/', pos: 'Verb', def: 'Make less severe, serious, or painful; alleviate.', ex: 'Load balancing helps mitigate the impact of sudden spikes in traffic.', syn: 'Alleviate, reduce, lessen', ant: 'Aggravate, intensify', diff: 'medium' },
      { word: 'Meticulous', pron: '/mɪˈtɪkjʊləs/', pos: 'Adjective', def: 'Showing great attention to detail; very careful and precise.', ex: 'Her meticulous code reviews helped prevent multiple security flaws in production.', syn: 'Diligent, scrupulous, thorough', ant: 'Careless, sloppy', diff: 'medium' },
      { word: 'Pernicious', pron: '/pəˈnɪʃəs/', pos: 'Adjective', def: 'Having a harmful effect, especially in a gradual or subtle way.', ex: 'Memory leaks have a pernicious effect on server performance over time.', syn: 'Harmful, damaging, destructive', ant: 'Beneficial, harmless', diff: 'hard' },
      { word: 'Ubiquitous', pron: '/juːˈbɪkwɪtəs/', pos: 'Adjective', def: 'Present, appearing, or found everywhere.', ex: 'Cloud computing has become ubiquitous in modern software engineering.', syn: 'Omnipresent, universal, pervasive', ant: 'Rare, scarce', diff: 'medium' },
      { word: 'Ephemeral', pron: '/ɪˈfɛmərəl/', pos: 'Adjective', def: 'Lasting for a very short time.', ex: 'Serverless containers often exist as ephemeral instances created on demand.', syn: 'Transitory, brief, fleeting', ant: 'Permanent, enduring', diff: 'hard' },
      { word: 'Resilient', pron: '/rɪˈzɪlɪənt/', pos: 'Adjective', def: 'Able to withstand or recover quickly from difficult conditions.', ex: 'The microservices cluster is resilient against individual node outages.', syn: 'Tough, adaptable, flexible', ant: 'Fragile, vulnerable', diff: 'easy' },
      { word: 'Cognizant', pron: '/ˈkɒɡnɪzənt/', pos: 'Adjective', def: 'Having knowledge or being aware of something.', ex: 'Engineers must remain cognizant of data privacy laws while logging telemetry.', syn: 'Aware, conscious, mindful', ant: 'Ignorant, unaware', diff: 'medium' },
      { word: 'Ambiguous', pron: '/æmˈbɪɡjuəs/', pos: 'Adjective', def: 'Open to more than one interpretation; having a double meaning.', ex: 'The project specifications were ambiguous, leading to conflicting implementations.', syn: 'Equivocal, obscure, vague', ant: 'Clear, unambiguous', diff: 'easy' },
      { word: 'Anomaly', pron: '/əˈnɒməli/', pos: 'Noun', def: 'Something that deviates from what is standard, normal, or expected.', ex: 'The automated monitoring system flagged an anomaly in CPU utilization.', syn: 'Oddity, irregularity, deviation', ant: 'Norm, conformity', diff: 'easy' },
      { word: 'Fastidious', pron: '/fæˈstɪdɪəs/', pos: 'Adjective', def: 'Very attentive to and concerned about accuracy and detail.', ex: 'He is fastidious about maintaining unit test coverage above 90 percent.', syn: 'Punctilious, particular, exacting', ant: 'Uncritical, easygoing', diff: 'hard' },
      { word: 'Eloquent', pron: '/ˈɛləkwənt/', pos: 'Adjective', def: 'Fluent or persuasive in speaking or writing.', ex: 'Her eloquent defense of the system design impressed the interviewing panel.', syn: 'Articulate, fluent, expressive', ant: 'Inarticulate, tongue-tied', diff: 'easy' },
      { word: 'Lucid', pron: '/ˈluːsɪd/', pos: 'Adjective', def: 'Expressed clearly; easy to understand.', ex: 'The API documentation is lucid and includes step-by-step examples.', syn: 'Intelligible, clear, transparent', ant: 'Confusing, murky', diff: 'easy' },
      { word: 'Prolific', pron: '/prəˈlɪfɪk/', pos: 'Adjective', def: 'Producing much fruit or foliage or many works of result.', ex: 'He is a prolific open source developer with over fifty active libraries.', syn: 'Productive, creative, fertile', ant: 'Unproductive, barren', diff: 'medium' },
      { word: 'Superfluous', pron: '/suːˈpɜːrluəs/', pos: 'Adjective', def: 'Unnecessary, especially through being more than enough.', ex: 'Refactoring removed superfluous loops and redundant database calls.', syn: 'Redundant, excess, needless', ant: 'Essential, necessary', diff: 'hard' },
      { word: 'Tenacious', pron: '/tɪˈneɪʃəs/', pos: 'Adjective', def: 'Tending to keep a firm hold of something; clinging or adhering closely.', ex: 'Her tenacious debugging uncovered a race condition that puzzled the senior team for weeks.', syn: 'Persevering, dogged, resolute', ant: 'Irresolute, yielding', diff: 'medium' },
      { word: 'Alacrity', pron: '/əˈlækrɪti/', pos: 'Noun', def: 'Brisk and cheerful readiness.', ex: 'The junior engineer accepted the challenge with enthusiasm and alacrity.', syn: 'Eagerness, willingness, readiness', ant: 'Apathy, reluctance', diff: 'hard' },
      { word: 'Candid', pron: '/ˈkændɪd/', pos: 'Adjective', def: 'Truthful and straightforward; frank.', ex: 'In the post-mortem meeting, we had a candid conversation about the deployment outage.', syn: 'Frank, honest, direct', ant: 'Guarded, secretive', diff: 'easy' },
      { word: 'Exemplary', pron: '/ɪɡˈzɛmpləri/', pos: 'Adjective', def: 'Serving as a desirable model; representing the best of its kind.', ex: 'The student received an offer due to an exemplary academic and project portfolio.', syn: 'Commendable, model, stellar', ant: 'Deplorable, substandard', diff: 'medium' },
      { word: 'Futile', pron: '/ˈfjuːtaɪl/', pos: 'Adjective', def: 'Incapable of producing any useful result; pointless.', ex: 'Attempting to patch unencrypted legacy protocols proved futile.', syn: 'Fruitless, useless, in vain', ant: 'Fruitful, effective', diff: 'easy' },
      { word: 'Impeccable', pron: '/ɪmˈpɛkəbl/', pos: 'Adjective', def: 'In accordance with the highest standards; faultless.', ex: 'His background check and academic track record were impeccable.', syn: 'Flawless, spotless, pristine', ant: 'Defective, flawed', diff: 'medium' },
      { word: 'Ingenious', pron: '/ɪnˈdʒiːniəs/', pos: 'Adjective', def: 'Clever, original, and inventive.', ex: 'She designed an ingenious caching algorithm that reduced memory overhead by half.', syn: 'Inventive, creative, resourceful', ant: 'Unimaginative, clumsy', diff: 'medium' },
      { word: 'Juxtapose', pron: '/ˌdʒʌkstəˈpəʊz/', pos: 'Verb', def: 'Place or deal with close together for contrasting effect.', ex: 'The presentation juxtaposed monolith architecture against modern serverless microservices.', syn: 'Compare, contrast, correlate', ant: 'Isolate, separate', diff: 'hard' },
      { word: 'Kudos', pron: '/ˈkjuːdɒs/', pos: 'Noun', def: 'Praise and honor received for an achievement.', ex: 'The placement cell gave kudos to the students for securing 100 percent offers in TCS Digital.', syn: 'Accolades, compliments, praise', ant: 'Criticism, blame', diff: 'easy' },
      { word: 'Laudable', pron: '/ˈlɔːdəbl/', pos: 'Adjective', def: 'Deserving praise and commendation.', ex: 'Their initiative to mentor underrepresented students in competitive coding is laudable.', syn: 'Praiseworthy, admirable, noble', ant: 'Blameworthy, shameful', diff: 'medium' },
      { word: 'Magnanimous', pron: '/mæɡˈnænɪməs/', pos: 'Adjective', def: 'Generous or forgiving, especially toward a rival or less powerful person.', ex: 'The competition winner was magnanimous in sharing credit with her team.', syn: 'Generous, benevolent, charitable', ant: 'Petty, vindictive', diff: 'hard' },
      { word: 'Nefarious', pron: '/nɪˈfɛəriəs/', pos: 'Adjective', def: 'Wicked, criminal, or villainous.', ex: 'The security team detected nefarious packets attempting SQL injection on the gateway.', syn: 'Heinous, evil, vile', ant: 'Virtuous, ethical', diff: 'hard' },
      { word: 'Opulent', pron: '/ˈɒpjʊlənt/', pos: 'Adjective', def: 'Ostentatiously rich and luxurious or lavish.', ex: 'The company welcomed the new recruits with an opulent onboarding orientation.', syn: 'Luxurious, affluent, grand', ant: 'Austere, poor', diff: 'medium' },
      { word: 'Paradox', pron: '/ˈpærədɒks/', pos: 'Noun', def: 'A seemingly absurd or self-contradictory statement that when investigated may prove to be well founded or true.', ex: 'The software paradox is that more features can sometimes lead to reduced user productivity.', syn: 'Contradiction, anomaly, enigma', ant: 'Certainty, consistency', diff: 'easy' },
      { word: 'Quell', pron: '/kwɛl/', pos: 'Verb', def: 'Put an end to a rebellion or other disorder, typically by the use of force; suppress or subdue.', ex: 'A timely status page update helped quell student panic during registration server downtime.', syn: 'Suppress, subdue, extinguish', ant: 'Instigate, inflame', diff: 'medium' }
    ];

    for (const v of vocabList) {
      await connection.query(
        `INSERT INTO vocabulary (word, pronunciation, part_of_speech, definition, example_sentence, synonyms, antonyms, difficulty)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [v.word, v.pron, v.pos, v.def, v.ex, v.syn, v.ant, v.diff]
      );
    }

    // 15. Seed 6 Interview Experiences
    console.log('⏳ Seeding 6 detailed interview experiences...');
    const experiences = [
      {
        company: 'Zoho Corporation',
        author: 'Siddharth Natarajan (Batch 2024)',
        role: 'Member Technical Staff',
        batch: 2024,
        verdict: 'Selected',
        diff: 'hard',
        rounds: 5,
        content: `**Campus Drive Experience - Zoho MTS Role**
Round 1 was a paper/online test of 90 minutes. 20 Aptitude questions and 15 C-programming outputs. Focus heavily on pointers, recursion, and pre-increment/post-increment subtleties.
Round 2: Basic Programming (5 questions). Problems included: Spiral matrix traversal, String compression (e.g., a3b2 -> aaabb), and finding valid subsets.
Round 3: Advanced Machine Coding (3 hours). We were asked to implement a Console-based Railway Reservation System with waiting lists, RAC berths, and cancellation mechanics. Clean OOP principles, modular classes, and handling edge cases were paramount.
Round 4: Technical Interview with a Lead Architect. He reviewed my Round 3 code line by line, asked me to refactor one module to handle thread-safe bookings, and grilled me on B-Tree indexing.
Round 5: HR Interview. Why Zoho? Salary expectations, willingness to relocate to Tenkasi/Chennai. Received the offer on the same night!`,
        tips: 'Do not use built-in language sorting or high-level library functions during Round 2 and 3. Zoho values deep understanding of pointers, array manipulations, and memory management from scratch in C or Java.'
      },
      {
        company: 'Tata Consultancy Services (TCS)',
        author: 'Aishwarya R (Batch 2024)',
        role: 'TCS Digital Cadre',
        batch: 2024,
        verdict: 'Selected',
        diff: 'medium',
        rounds: 3,
        content: `**TCS NQT Digital On-Campus Experience**
The test was conducted on the TCS iON platform.
Part A: Cognitive (Advanced Numerical, Advanced Verbal, Advanced Reasoning). 40 questions in 50 minutes. Speed was critical.
Part B: Advanced Coding. 2 problems. Question 1 was an array rotation problem with dynamic queries. Question 2 was a Dynamic Programming problem (variation of Coin Change). I passed all test cases for Q1 and 8/10 test cases for Q2.
Interview: A 45-minute virtual panel with 3 interviewers (Technical, Managerial, HR). Asked about my final year project on Kubernetes and distributed storage, difference between Inner and Left joins, and ACID properties with real banking examples.`,
        tips: 'Time management in NQT is everything. Don\'t get stuck on one numeric calculation. For the coding section, ensure you write code that handles large constraints (use long long in C++ or BigInteger/long in Java).'
      },
      {
        company: 'Infosys Limited',
        author: 'Dinesh Balasubramanian (Batch 2024)',
        role: 'Specialist Programmer (Power Programmer)',
        batch: 2024,
        verdict: 'Selected',
        diff: 'hard',
        rounds: 3,
        content: `**HackWithInfy / Specialist Programmer Interview**
I qualified through HackWithInfy round 2 where I solved 2 out of 3 hard problems (Segment Trees and Dijkstra with state).
Technical Interview: Lasted 1 hour and 15 minutes. The interviewer asked me to open an IDE and live-code:
1. Longest Valid Parentheses substring in O(N) time and O(1) space.
2. Design a thread-safe Singleton pattern in Java with Double-Checked Locking and explain the need for the \`volatile\` keyword.
3. System Design: How would you design a distributed URL Shortener (Bitly) handling 100M daily clicks?
The interviewer was extremely collaborative and guided me whenever I hesitated on hash collisions.`,
        tips: 'Specialist Programmer roles demand strong knowledge of Advanced Data Structures (Trie, Segment Trees, Disjoint Set Union) and low-level concurrency mechanisms.'
      },
      {
        company: 'Accenture India',
        author: 'Rohit Verma (Batch 2024)',
        role: 'Advanced Application Engineering Analyst',
        batch: 2024,
        verdict: 'Selected',
        diff: 'medium',
        rounds: 4,
        content: `**Accenture Full Assessment Journey**
Assessment 1: Cognitive + Technical MCQs. Questions on pseudocode, MS Office, cloud fundamentals, and critical thinking. If you clear the cut-off, you immediately unlock Assessment 2 (Coding) within 10 minutes.
Assessment 2 (Coding): 2 questions in 45 minutes. Q1: Palindrome string transformations. Q2: Bitwise manipulation on an integer array. Cleared both.
Assessment 3: Communication Assessment (Automated Voice Interview). You hear prompts and must repeat sentences, speak on given topics for 1 minute, and retell short stories.
Assessment 4: HR + Technical Panel Interview. Discussion on strengths, weaknesses, project leadership conflicts, and a quick query on indexing in MongoDB.`,
        tips: 'Use a high-quality wired headset for the communication test in a completely silent room. Even minor background noise can hurt the automated scoring engine.'
      },
      {
        company: 'Cognizant Technology Solutions',
        author: 'Meera Krishnan (Batch 2024)',
        role: 'GenC Elevate',
        batch: 2024,
        verdict: 'Selected',
        diff: 'medium',
        rounds: 3,
        content: `**Cognizant GenC Elevate Assessment**
Round 1 had Quantitative, Analytical, and Code Debugging. Code debugging required finding semantic errors in 7 code blocks in 20 minutes.
Round 2: Coding Assessment (2 questions). One was an SQL query involving multiple joins with \`DENSE_RANK()\` and the second was a 2D array matrix path counting question.
Final Interview: 30 minutes. The interviewer asked about REST API status codes (200, 201, 400, 401, 403, 500), difference between process and thread, and why I chose React over traditional templates for my portfolio project.`,
        tips: 'Review SQL window functions (ROW_NUMBER, RANK, DENSE_RANK) as Cognizant frequently includes at least one database query challenge.'
      },
      {
        company: 'Wipro Technologies',
        author: 'Harish Venkat (Batch 2024)',
        role: 'Wipro Elite / Turbo',
        batch: 2024,
        verdict: 'Selected',
        diff: 'easy',
        rounds: 3,
        content: `**Wipro National Talent Hunt Experience**
Round 1: 3 sections. Aptitude, Written Communication (Essay writing on topic: "Impact of Artificial Intelligence on Manufacturing Jobs"), and 2 coding questions. The essay requires proper grammar, no spelling errors, and around 200-250 words.
Round 2: Technical Interview. 25 minutes. Asked to write a program to check for Anagram strings. Asked basic questions about normalization, primary vs unique key, and explain Polymorphism with a real-world vehicle example.
Round 3: HR Interview. Document verification, night shifts and rotational shift agreement.`,
        tips: 'Do not use backspace excessively in the essay writing tool; plan your thoughts before typing. Focus on clear grammar and simple vocabulary.'
      }
    ];

    for (const exp of experiences) {
      await connection.query(
        `INSERT INTO interview_experiences (company_id, author_name, role_title, batch_year, verdict, difficulty, rounds_count, content, tips)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          companyIds[exp.company], exp.author, exp.role, exp.batch, exp.verdict, exp.diff,
          exp.rounds, exp.content, exp.tips
        ]
      );
    }

    // 16. Seed 12 Learning Videos (real YouTube format)
    console.log('⏳ Seeding 12 curated placement preparation videos...');
    const videoList = [
      { title: 'Time and Work - Complete Formula & Shortcut Tricks', cat: 'Quantitative Aptitude', diff: 'easy', url: 'https://www.youtube.com/watch?v=KE7tQf9spPg', duration: '28:15', desc: 'Master all shortcut formulas for Unitary method, Pipes & Cisterns, and Alternating Days work problems.' },
      { title: 'Permutations & Combinations Explained Visually', cat: 'Quantitative Aptitude', diff: 'medium', url: 'https://www.youtube.com/watch?v=XqQTXW7XfYA', duration: '35:40', desc: 'Detailed breakdown of combination vs permutation, circular arrangements, and repetition rules.' },
      { title: 'Probability Rules & Bayes Theorem for Placement Tests', cat: 'Quantitative Aptitude', diff: 'hard', url: 'https://www.youtube.com/watch?v=R13BD8qKeTg', duration: '42:10', desc: 'Solve conditional probability, independent events, and dice/card problems with zero confusion.' },
      { title: 'DBMS Full Course - From ER Diagrams to Normalization & SQL', cat: 'Technical Concepts', diff: 'easy', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', duration: '55:20', desc: 'Complete review of Relational Algebra, SQL queries, Indexing (B-Trees), and 1NF to BCNF.' },
      { title: 'Operating Systems - Concurrency, Deadlocks & Memory Management', cat: 'Technical Concepts', diff: 'medium', url: 'https://www.youtube.com/watch?v=vBURTt97EkA', duration: '48:30', desc: 'Understand semaphores, mutexes, virtual memory paging, thrashing and CPU scheduling algorithms.' },
      { title: 'Computer Networks - OSI Model & TCP/IP Protocol Suite in 1 Shot', cat: 'Technical Concepts', diff: 'medium', url: 'https://www.youtube.com/watch?v=IPvYjXCsTg8', duration: '50:15', desc: 'Covers DNS, HTTP/HTTPS, TCP 3-way handshake, Subnetting calculations, and routing protocols.' },
      { title: 'Top 10 Dynamic Programming Patterns for Coding Interviews', cat: 'Coding Interview', diff: 'hard', url: 'https://www.youtube.com/watch?v=oBt53YbR9Kk', duration: '62:00', desc: 'Detailed walkthrough of 0/1 Knapsack, Longest Common Subsequence, and Matrix Chain Multiplication.' },
      { title: 'Graph Algorithms: BFS, DFS, Dijkstra & Topological Sort', cat: 'Coding Interview', diff: 'hard', url: 'https://www.youtube.com/watch?v=tWVWeAqZ0WU', duration: '58:45', desc: 'Step-by-step code implementation in Java & C++ with adjacency list and cycle detection.' },
      { title: 'Two Pointers and Sliding Window Coding Techniques', cat: 'Coding Interview', diff: 'easy', url: 'https://www.youtube.com/watch?v=jM2dhDPYMQM', duration: '32:20', desc: 'Solve subarray and string window problems in linear O(N) time complexity.' },
      { title: 'How to Answer "Tell Me About Yourself" in Placement Interviews', cat: 'HR Prep', diff: 'easy', url: 'https://www.youtube.com/watch?v=kayOhGRgk84', duration: '18:10', desc: 'Craft a compelling 90-second professional elevator pitch highlighting projects and achievements.' },
      { title: 'STAR Method for Behavioral & Situational Questions', cat: 'HR Prep', diff: 'medium', url: 'https://www.youtube.com/watch?v=0kI_g_m9X_s', duration: '22:45', desc: 'Situation, Task, Action, Result framework for answering leadership, failure, and teamwork questions.' },
      { title: 'Salary Negotiation & Offer Letter Evaluation for Freshers', cat: 'HR Prep', diff: 'easy', url: 'https://www.youtube.com/watch?v=YwL3Q5w09X8', duration: '19:30', desc: 'Understand CTC breakdown, fixed vs variable pay, bond clauses, and joining formalities.' }
    ];

    for (const v of videoList) {
      await connection.query(
        `INSERT INTO videos (title, description, category, difficulty, youtube_url, duration)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [v.title, v.desc, v.cat, v.diff, v.url, v.duration]
      );
    }

    // 17. Seed 6 Placement Resources
    console.log('⏳ Seeding 6 placement notes & formula cheat sheets...');
    const resources = [
      {
        title: 'Master Placement Resume Template (ATS-Optimized LaTeX & Word)',
        category: 'Resume Templates',
        fileUrl: '/uploads/resumes/sample_ats_resume_template.pdf',
        fileType: 'PDF',
        desc: 'Single-page battle-tested template rated 95+ on leading ATS scanners. Includes sample bullet points with metrics.'
      },
      {
        title: 'Complete Quantitative Aptitude Formula Cheat Sheet (All Topics)',
        category: 'Aptitude Formulas',
        fileUrl: '/uploads/resumes/aptitude_formula_handbook.pdf',
        fileType: 'PDF',
        desc: 'Condensed 12-page PDF containing all formulas, shortcuts and tables for Speed Math, P&C, Time-Distance, and Geometry.'
      },
      {
        title: 'Core Operating Systems Revision Notes & Interview Q&A',
        category: 'Core CS Notes',
        fileUrl: '/uploads/resumes/os_interview_notes.pdf',
        fileType: 'PDF',
        desc: 'Concise summary of process synchronization, Peterson algorithm, deadlock avoidance (Banker\'s algorithm), and paging.'
      },
      {
        title: 'Database Management Systems & SQL Query Handbook',
        category: 'Core CS Notes',
        fileUrl: '/uploads/resumes/dbms_sql_handbook.pdf',
        fileType: 'PDF',
        desc: '50 most frequently asked SQL interview queries, indexing architectures, transactions, and ACID isolation levels.'
      },
      {
        title: 'Data Structures & Algorithms 75 Most Important Interview Patterns',
        category: 'Interview Cheat Sheets',
        fileUrl: '/uploads/resumes/dsa_patterns_guide.pdf',
        fileType: 'PDF',
        desc: 'Visual roadmap of blind 75 problems categorized by pattern with pseudocode and time/space complexity analysis.'
      },
      {
        title: 'Top 50 Behavioral & HR Interview Questions with Sample Answers',
        category: 'HR Question Bank',
        fileUrl: '/uploads/resumes/hr_interview_handbook.pdf',
        fileType: 'PDF',
        desc: 'Frameworks and winning answers for conflict resolution, gap justification, strengths/weaknesses, and company fitment.'
      }
    ];

    for (const r of resources) {
      await connection.query(
        `INSERT INTO resources (title, category, file_url, file_type, description)
         VALUES (?, ?, ?, ?, ?)`,
        [r.title, r.category, r.fileUrl, r.fileType, r.desc]
      );
    }

    // 18. Seed Broadcast Notifications
    console.log('⏳ Seeding system notifications...');
    const notifications = [
      {
        studentId: null,
        title: 'New Placement Drive: Zoho Corporation (MTS Role - 8.5 LPA)',
        message: 'Zoho Corporation has announced their campus drive for Software Development (MTS). Applications are now open for CSE, IT, AIDS, ECE branches. Deadline: Oct 10.',
        type: 'new_company',
        link: '/student/companies'
      },
      {
        studentId: null,
        title: 'Application Deadline Approaching: TCS Digital (7.5 LPA)',
        message: 'Only 3 days left to submit your application for the TCS Digital Cadre campus drive. Verify your academic criteria and apply now.',
        type: 'deadline_approaching',
        link: '/student/companies'
      },
      {
        studentId: null,
        title: 'New Mock Test Available: TCS NQT Foundation Aptitude',
        message: 'A new 30-minute timed mock test matching the latest TCS NQT pattern has been published. Practice to assess your speed and accuracy.',
        type: 'new_test',
        link: '/student/tests'
      },
      {
        studentId: null,
        title: "Today's Daily Challenge is Live! Earn 15 Points",
        message: "Solve today's bitwise algorithm challenge to keep your daily streak alive and climb the placement readiness leaderboard.",
        type: 'daily_challenge',
        link: '/student/challenges'
      },
      {
        studentId: studentIds[0], // Personal notification for Arun
        title: 'Application Status Update: Shortlisted for TCS Digital',
        message: 'Congratulations Arun! Your profile has been shortlisted for Round 1 of the TCS Digital placement drive.',
        type: 'status_change',
        link: '/student/applications'
      },
      {
        studentId: studentIds[1], // Personal notification for Priya
        title: 'Interview Scheduled: Zoho Corporation MTS',
        message: 'Hi Priya, you have been invited to the Technical Interview round for Zoho Corporation on Oct 16th.',
        type: 'status_change',
        link: '/student/applications'
      }
    ];

    for (const n of notifications) {
      await connection.query(
        `INSERT INTO notifications (student_id, title, message, type, link, is_read)
         VALUES (?, ?, ?, ?, ?, FALSE)`,
        [n.studentId, n.title, n.message, n.type, n.link]
      );
    }

    console.log('================================================================');
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('================================================================');
    console.log(`Database: ${dbName}`);
    console.log(`Admin Login: ${adminEmail} | Password: ${adminRawPassword}`);
    console.log('Demo Student: arun.kumar@student.edu (or 953621104001) | Password: Student@123');
    console.log('Demo Student: priya.sharma@student.edu (or 953621104002) | Password: Student@123');
    console.log('Demo Student: ananya.deshmukh@student.edu (or 953621104006) | Password: Student@123');
    console.log('================================================================');

  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();

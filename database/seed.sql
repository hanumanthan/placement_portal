-- =============================================================================
-- Campus Placement Portal - Demo Seed Data (Fictional Demo Data for Testing)
-- Database: placement_portal
-- NOTE: Passwords here are hashed with bcrypt (cost 10).
-- Admin Password: Admin@123
-- Student Passwords: Student@123
-- =============================================================================

USE `placement_portal`;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. Departments
-- -----------------------------------------------------------------------------
INSERT INTO `departments` (`id`, `code`, `name`) VALUES
(1, 'CSE', 'Computer Science and Engineering'),
(2, 'IT', 'Information Technology'),
(3, 'AIDS', 'Artificial Intelligence and Data Science'),
(4, 'ECE', 'Electronics and Communication Engineering'),
(5, 'EEE', 'Electrical and Electronics Engineering'),
(6, 'MECH', 'Mechanical Engineering'),
(7, 'CIVIL', 'Civil Engineering')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- -----------------------------------------------------------------------------
-- 2. Admin Account (Email: admin@placementportal.com, Password: Admin@123)
-- -----------------------------------------------------------------------------
INSERT INTO `admins` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'Campus Placement Officer', 'admin@placementportal.com', '$2b$10$wT0X1K7qI3oVqP6Jm2J93uT71z.3188Z36o00aE30p.U16n0e3hG6', 'admin')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- -----------------------------------------------------------------------------
-- 3. Demo Students (Password: Student@123 for all demo accounts)
-- -----------------------------------------------------------------------------
INSERT INTO `students` (`id`, `register_number`, `full_name`, `email`, `phone`, `password`, `department`, `course`, `batch`, `graduation_year`, `is_active`, `role`) VALUES
(1, '953621104001', 'Arun Kumar', 'arun.kumar@student.edu', '9876543210', '$2b$10$vN9qE1yUf7K54P0Qj7r.8e0eLq7Fp6iK.iHkGv1W3lZ9vV2E.mKqu', 'CSE', 'B.Tech', '2021-2025', 2025, 1, 'student'),
(2, '953621104002', 'Priya Sharma', 'priya.sharma@student.edu', '9876543211', '$2b$10$vN9qE1yUf7K54P0Qj7r.8e0eLq7Fp6iK.iHkGv1W3lZ9vV2E.mKqu', 'IT', 'B.Tech', '2021-2025', 2025, 1, 'student'),
(3, '953621104003', 'Karthik Raja', 'karthik.raja@student.edu', '9876543212', '$2b$10$vN9qE1yUf7K54P0Qj7r.8e0eLq7Fp6iK.iHkGv1W3lZ9vV2E.mKqu', 'ECE', 'B.Tech', '2021-2025', 2025, 1, 'student'),
(4, '953621104004', 'Sneha Patel', 'sneha.patel@student.edu', '9876543213', '$2b$10$vN9qE1yUf7K54P0Qj7r.8e0eLq7Fp6iK.iHkGv1W3lZ9vV2E.mKqu', 'AIDS', 'B.Tech', '2021-2025', 2025, 1, 'student'),
(5, '953621104005', 'Vignesh Balaji', 'vignesh.balaji@student.edu', '9876543214', '$2b$10$vN9qE1yUf7K54P0Qj7r.8e0eLq7Fp6iK.iHkGv1W3lZ9vV2E.mKqu', 'MECH', 'B.Tech', '2021-2025', 2025, 1, 'student'),
(6, '953621104006', 'Ananya Deshmukh', 'ananya.deshmukh@student.edu', '9876543215', '$2b$10$vN9qE1yUf7K54P0Qj7r.8e0eLq7Fp6iK.iHkGv1W3lZ9vV2E.mKqu', 'CSE', 'B.Tech', '2021-2025', 2025, 1, 'student');

-- -----------------------------------------------------------------------------
-- 4. Student Profiles
-- -----------------------------------------------------------------------------
INSERT INTO `student_profiles` (`id`, `student_id`, `cgpa`, `tenth_percentage`, `twelfth_percentage`, `standing_arrears`, `history_arrears`, `bio`, `github_url`, `linkedin_url`, `portfolio_url`) VALUES
(1, 1, 8.85, 92.50, 89.00, 0, 0, 'Aspiring Full Stack Software Engineer passionate about backend systems, distributed architectures, and competitive programming.', 'https://github.com/arunkumar', 'https://linkedin.com/in/arunkumar', 'https://arunkumar.dev'),
(2, 2, 9.15, 95.00, 93.50, 0, 0, 'Data Science enthusiast with research experience in applied NLP and automated data pipeline development.', 'https://github.com/priyasharma', 'https://linkedin.com/in/priyasharma', 'https://priyasharma.dev'),
(3, 3, 7.80, 84.00, 81.00, 0, 1, 'Hardware-Software co-design enthusiast looking for embedded firmware and systems engineering roles.', 'https://github.com/karthikraja', 'https://linkedin.com/in/karthikraja', 'https://karthikraja.dev'),
(4, 4, 8.40, 88.50, 86.00, 0, 0, 'AI & Data Science student exploring Generative AI models and big data analytics for high-impact products.', 'https://github.com/snehapatel', 'https://linkedin.com/in/snehapatel', 'https://snehapatel.dev'),
(5, 5, 6.95, 78.00, 74.00, 1, 2, 'Mechanical engineering major transitioning into automotive automation and design analysis.', 'https://github.com/vigneshbalaji', 'https://linkedin.com/in/vigneshbalaji', 'https://vigneshbalaji.dev'),
(6, 6, 9.40, 96.00, 95.00, 0, 0, 'Open source contributor and cloud-native enthusiast. Solved 450+ LeetCode problems.', 'https://github.com/ananyadeshmukh', 'https://linkedin.com/in/ananyadeshmukh', 'https://ananyadeshmukh.dev');

-- -----------------------------------------------------------------------------
-- 5. Student Skills
-- -----------------------------------------------------------------------------
INSERT INTO `student_skills` (`student_id`, `skill_name`, `proficiency`) VALUES
(1, 'Java', 'advanced'), (1, 'Spring Boot', 'advanced'), (1, 'MySQL', 'advanced'), (1, 'React', 'advanced'), (1, 'Data Structures', 'advanced'),
(2, 'Python', 'advanced'), (2, 'Machine Learning', 'advanced'), (2, 'TensorFlow', 'advanced'), (2, 'SQL', 'advanced'), (2, 'AWS', 'advanced'),
(3, 'C++', 'advanced'), (3, 'Embedded Systems', 'advanced'), (3, 'IoT', 'advanced'), (3, 'Linux', 'advanced'),
(4, 'Python', 'advanced'), (4, 'Deep Learning', 'advanced'), (4, 'PyTorch', 'advanced'), (4, 'Tableau', 'advanced'),
(5, 'AutoCAD', 'advanced'), (5, 'SolidWorks', 'advanced'), (5, 'ANSYS', 'advanced'), (5, 'Python', 'advanced'),
(6, 'Go', 'advanced'), (6, 'Kubernetes', 'advanced'), (6, 'Cloud Architecture', 'advanced'), (6, 'React', 'advanced'), (6, 'Node.js', 'advanced');

-- -----------------------------------------------------------------------------
-- 6. Student Streaks
-- -----------------------------------------------------------------------------
INSERT INTO `student_streaks` (`student_id`, `current_streak`, `max_streak`, `total_points`, `challenges_completed`, `last_activity_date`) VALUES
(1, 14, 19, 280, 14, CURDATE()),
(2, 22, 27, 440, 22, CURDATE()),
(3, 5, 10, 100, 5, CURDATE()),
(4, 9, 14, 180, 9, CURDATE()),
(5, 2, 7, 40, 2, CURDATE()),
(6, 30, 35, 620, 30, CURDATE());

-- -----------------------------------------------------------------------------
-- 7. Companies
-- -----------------------------------------------------------------------------
INSERT INTO `companies` (`id`, `name`, `website`, `industry`, `headquarters`, `description`) VALUES
(1, 'Tata Consultancy Services (TCS)', 'https://www.tcs.com', 'IT Services & Consulting', 'Mumbai, Maharashtra', 'TCS is a global leader in IT services, consulting & business solutions with a vast network of innovation and delivery centers.'),
(2, 'Infosys Limited', 'https://www.infosys.com', 'Information Technology', 'Bengaluru, Karnataka', 'Infosys is a global leader in next-generation digital services and consulting, enabling clients across 56 countries.'),
(3, 'Wipro Technologies', 'https://www.wipro.com', 'IT Services & Consulting', 'Bengaluru, Karnataka', 'Wipro is a leading technology services and consulting company focused on building innovative solutions addressing digital transformation needs.'),
(4, 'Accenture India', 'https://www.accenture.com', 'Management Consulting & IT', 'Dublin, Ireland / Bengaluru', 'Accenture is a global professional services company with leading capabilities in digital, cloud, and security.'),
(5, 'Cognizant Technology Solutions', 'https://www.cognizant.com', 'Digital & IT Services', 'Teaneck, NJ / Chennai', 'Cognizant engineers modern businesses, modernizing technologies, reimagining processes and transforming experiences.'),
(6, 'Zoho Corporation', 'https://www.zoho.com', 'Cloud Software & SaaS Products', 'Chennai, Tamil Nadu', 'Zoho creates elegant enterprise applications to solve business problems with over 100M+ users globally.');

-- -----------------------------------------------------------------------------
-- 8. Company Recruitment History
-- -----------------------------------------------------------------------------
INSERT INTO `company_history` (`company_id`, `year`, `total_appeared`, `total_selected`, `highest_package`, `average_package`) VALUES
(1, 2021, 320, 110, 7.00, 3.80),
(1, 2022, 360, 135, 9.00, 4.00),
(1, 2023, 310, 95, 11.50, 4.20),
(1, 2024, 290, 88, 11.50, 4.50),
(2, 2021, 280, 90, 6.50, 3.60),
(2, 2022, 310, 110, 9.50, 4.20),
(2, 2023, 260, 75, 9.50, 4.40),
(2, 2024, 240, 68, 10.00, 4.60),
(3, 2022, 250, 72, 6.50, 3.50),
(3, 2023, 220, 58, 7.50, 3.80),
(3, 2024, 210, 62, 8.50, 4.00),
(4, 2022, 340, 120, 8.50, 4.50),
(4, 2023, 300, 95, 9.50, 4.80),
(4, 2024, 310, 105, 12.00, 5.20),
(5, 2022, 280, 85, 7.00, 4.00),
(5, 2023, 270, 80, 8.00, 4.20),
(5, 2024, 250, 76, 10.00, 4.50),
(6, 2021, 210, 24, 8.50, 6.50),
(6, 2022, 240, 32, 10.00, 7.20),
(6, 2023, 220, 28, 12.50, 7.80),
(6, 2024, 260, 35, 15.00, 8.40);

-- -----------------------------------------------------------------------------
-- 9. Placement Drives (8+ drives: upcoming, ongoing, past)
-- -----------------------------------------------------------------------------
INSERT INTO `placement_drives` (`id`, `company_id`, `job_title`, `job_description`, `location`, `employment_type`, `package_lpa`, `stipend_monthly`, `drive_date`, `application_deadline`, `eligible_departments`, `min_cgpa`, `min_tenth_percentage`, `min_twelfth_percentage`, `max_standing_arrears`, `max_history_arrears`, `required_skills`, `official_apply_link`, `instructions`, `status`) VALUES
(1, 6, 'Member Technical Staff (Software Developer)', 'Zoho is looking for passionate problem solvers capable of writing clean, maintainable code. The role involves building full-stack cloud applications, internal frameworks, and backend microservices.', 'Chennai / Tenkasi', 'Full-time', 8.50, 25000.00, '2026-10-15', '2026-10-10 23:59:59', 'CSE,IT,AIDS,ECE', 7.00, 75.00, 75.00, 0, 1, 'C, C++, Java, Data Structures, Algorithms, Problem Solving', 'https://careers.zohocorp.com/apply/mts-freshers-2025', 'Please bring your college ID card, 2 copies of resume, and laptop for hands-on machine coding rounds.', 'published'),
(2, 1, 'TCS Digital Cadre Software Engineer', 'TCS Digital offers roles in high-demand next-gen technologies including AI/ML, Cloud Computing, Cybersecurity, and IoT.', 'Pan India (Bengaluru, Chennai, Hyderabad)', 'Full-time', 7.50, 0.00, '2026-10-22', '2026-10-18 23:59:59', 'CSE,IT,AIDS,ECE,EEE', 7.50, 70.00, 70.00, 0, 0, 'Java, Python, DBMS, OS, Data Structures', 'https://nextstep.tcs.com/campus/#/digital-drive-2025', 'Registration on TCS NextStep portal with CT/DT reference number is mandatory before campus screening.', 'published'),
(3, 2, 'Specialist Programmer (Power Programmer)', 'Specialist Programmers at Infosys work on high-complexity algorithmic challenges, distributed cloud architecture, and competitive coding pipelines.', 'Bengaluru / Hyderabad / Pune', 'Full-time', 9.50, 0.00, '2026-11-05', '2026-10-30 23:59:59', 'CSE,IT,AIDS,ECE', 8.00, 80.00, 80.00, 0, 0, 'Dynamic Programming, Graph Theory, Java, Python, C++', 'https://infytq.onwingspan.com/sp-drive-register', 'HackWithInfy qualifiers or direct SP test cleared candidates will be given direct technical interviews.', 'published'),
(4, 4, 'Advanced Application Engineering Analyst', 'Design, develop, and configure software applications to meet business process and application requirements.', 'Bengaluru, Hyderabad, Chennai, Gurugram', 'Full-time', 6.50, 0.00, '2026-11-12', '2026-11-08 23:59:59', 'CSE,IT,AIDS,ECE,EEE,MECH,CIVIL', 6.50, 65.00, 65.00, 0, 1, 'SQL, Java, Cloud Basics, Critical Thinking', 'https://indiacampus.accenture.com/register/ase-2025', 'Virtual assessment links will be dispatched directly to verified email addresses.', 'published'),
(5, 5, 'GenC Elevate Developer', 'GenC Elevate engineers create scalable enterprise solutions leveraging modern tech stacks, microservices, and full stack JavaScript/Java.', 'Coimbatore, Chennai, Bengaluru', 'Full-time', 5.40, 0.00, '2026-11-20', '2026-11-15 23:59:59', 'CSE,IT,AIDS,ECE,EEE', 6.80, 60.00, 60.00, 0, 1, 'Java, HTML, CSS, JavaScript, SQL', 'https://cognizant.hirepro.in/genc-elevate-registration', 'Eligible students should complete the Skill-Badge verification prior to drive day.', 'published'),
(6, 3, 'Turbo Candidate (Software Developer)', 'Wipro Turbo is designed for students with premier programming talent to take on complex engineering roles.', 'Bengaluru / Hyderabad / Chennai', 'Full-time', 6.50, 0.00, '2026-11-28', '2026-11-22 23:59:59', 'CSE,IT,AIDS,ECE', 7.00, 70.00, 70.00, 0, 0, 'C++, Java, Python, RDBMS', 'https://careers.wipro.com/elite-turbo-2025', 'Candidates must possess active passport or receipt of passport application.', 'published'),
(7, 1, 'TCS Ninja Graduate Trainee', 'Core software engineering role focusing on enterprise application development, testing, and cloud migrations.', 'Pan India', 'Full-time', 4.20, 0.00, '2026-08-10', '2026-08-01 23:59:59', 'CSE,IT,AIDS,ECE,EEE,MECH,CIVIL', 6.00, 60.00, 60.00, 1, 2, 'Basics of C/Python, Logical Reasoning, Aptitude', 'https://nextstep.tcs.com/ninja-past', 'Campus drive completed.', 'completed'),
(8, 6, 'Product Support Engineer & QA', 'Focuses on testing complex cloud business suites, reproducing customer bugs, and building test automation suites.', 'Chennai / Salem', 'Full-time', 5.50, 18000.00, '2026-08-25', '2026-08-18 23:59:59', 'CSE,IT,AIDS,ECE,EEE,MECH,CIVIL', 6.50, 65.00, 65.00, 0, 1, 'Analytical Skills, SQL, Shell Scripting, Networking', 'https://careers.zohocorp.com/support-past', 'Drive completed.', 'completed');

-- -----------------------------------------------------------------------------
-- 10. Drive Rounds
-- -----------------------------------------------------------------------------
INSERT INTO `drive_rounds` (`drive_id`, `round_number`, `round_name`, `description`) VALUES
(1, 1, 'Round 1: General Aptitude & Basic C Programming', 'MCQs on quantitative, verbal, logical and C output debugging (90 mins)'),
(1, 2, 'Round 2: Basic Programming', '5 coding problems focused on loops, arrays, strings and recursion.'),
(1, 3, 'Round 3: Advanced Machine Coding', 'Mini-application development (e.g., Railway Reservation, Banking CLI, Matrix operations).'),
(1, 4, 'Round 4: Technical Interview', 'Deep dive into data structures, time complexity, and system design basics.'),
(1, 5, 'Round 5: HR Interview', 'Cultural fitment, values and package discussion.'),
(2, 1, 'TCS National Qualifier Test (NQT Digital)', 'Advanced Cognitive & Programming Assessments'),
(2, 2, 'Technical & Coding Interview', 'Live problem solving, OOP concepts, SQL queries'),
(2, 3, 'HR & Managerial Discussion', 'Behavioral and location flexibility verification'),
(3, 1, 'InfyTQ Assessment / Coding Round', '3 high-difficulty algorithmic challenges (3 hours)'),
(3, 2, 'Technical Interview', 'Core CS subjects, DP, Graphs, Database indexing and concurrency'),
(3, 3, 'Leadership & HR Interview', 'Project architecture review and managerial fit'),
(4, 1, 'Cognitive & Technical Assessment', 'English ability, Critical Thinking, Abstract Reasoning, Common Application Tech'),
(4, 2, 'Coding Assessment', '2 coding problems in candidate choice language (45 mins)'),
(4, 3, 'Communication Assessment', 'Automated AI-based verbal assessment'),
(4, 4, 'Interview', 'Integrated Technical + HR Virtual Interview');

-- -----------------------------------------------------------------------------
-- 11. Applications
-- -----------------------------------------------------------------------------
INSERT INTO `applications` (`id`, `student_id`, `drive_id`, `status`, `notes`) VALUES
(1, 1, 1, 'Applied', 'Candidate applied directly via campus portal.'),
(2, 1, 2, 'Shortlisted', 'Shortlisted for Round 1 assessment.'),
(3, 1, 7, 'Selected', 'Offered role at 4.2 LPA.'),
(4, 2, 1, 'Interview', 'Advanced to Technical Interview round.'),
(5, 2, 3, 'Applied', 'Awaiting assessment slot.'),
(6, 2, 4, 'Shortlisted', 'Cleared cognitive test.'),
(7, 3, 2, 'Applied', 'Registered for drive.'),
(8, 3, 4, 'Test Completed', 'Assessment completed, waiting for results.'),
(9, 4, 1, 'Interested', 'Marked interest.'),
(10, 4, 5, 'Shortlisted', 'Shortlisted for GenC Elevate.'),
(11, 5, 4, 'Applied', 'Application under review.'),
(12, 5, 8, 'Rejected', 'Did not clear round 2.'),
(13, 6, 1, 'Selected', 'Offer released at 8.5 LPA.'),
(14, 6, 3, 'Interview', 'Invited to leadership interview.');

-- -----------------------------------------------------------------------------
-- 12. Previous Questions (40+ items across categories)
-- -----------------------------------------------------------------------------
INSERT INTO `previous_questions` (`company_id`, `year`, `category`, `difficulty`, `question_text`, `options`, `correct_answer`, `explanation`) VALUES
(1, 2024, 'Aptitude', 'easy', 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?', '["65 seconds", "89 seconds", "100 seconds", "150 seconds"]', '89 seconds', 'Speed = Distance / Time = 240 / 24 = 10 m/s. Total distance = 240 + 650 = 890 m. Time = 890 / 10 = 89 seconds.'),
(2, 2024, 'Aptitude', 'medium', 'A and B can do a piece of work in 12 days, B and C in 15 days, and C and A in 20 days. How long will A alone take to finish the work?', '["30 days", "20 days", "40 days", "24 days"]', '30 days', '2(A + B + C)\'s 1 day work = 1/12 + 1/15 + 1/20 = 12/60 = 1/5. (A + B + C) = 1/10. A alone = 1/10 - 1/15 = 1/30. So 30 days.'),
(3, 2023, 'Aptitude', 'easy', 'The average of 5 consecutive odd numbers is 27. What is the value of the smallest of these numbers?', '["21", "23", "25", "27"]', '23', 'The average is the middle number (27). The numbers are 23, 25, 27, 29, 31. Smallest is 23.'),
(6, 2024, 'Aptitude', 'hard', 'In a mixture of 60 liters, the ratio of milk and water is 2:1. If this ratio is to be 1:2, then what quantity of water should be further added?', '["20 liters", "40 liters", "60 liters", "80 liters"]', '60 liters', 'Initial milk = 40 L, water = 20 L. For 1:2 ratio, milk is 40 L, so water must be 80 L. Additional water = 80 - 20 = 60 liters.'),
(4, 2023, 'Aptitude', 'medium', 'A vendor bought toffees at 6 for a rupee. How many for a rupee must he sell to gain 20%?', '["3", "4", "5", "6"]', '5', 'CP of 6 = Re 1. SP of 6 = Rs 1.20 = 6/5. For Re 1, toffees = 6 * (5/6) = 5.'),
(5, 2024, 'Aptitude', 'easy', 'If the simple interest on a sum of money for 2 years at 5% per annum is Rs. 50, what is the compound interest on the same at the same rate and for the same time?', '["Rs. 51.25", "Rs. 52.00", "Rs. 54.50", "Rs. 55.00"]', 'Rs. 51.25', 'Principal = (50 * 100) / (5 * 2) = Rs. 500. CI = 500 * [(1.05)^2 - 1] = Rs. 51.25.'),
(1, 2023, 'Aptitude', 'medium', 'A pipe can fill a tank in 15 hours. Due to a leak in the bottom, it is filled in 20 hours. If the tank is full, how much time will the leak take to empty it?', '["40 hours", "50 hours", "60 hours", "75 hours"]', '60 hours', 'Leak rate = 1/15 - 1/20 = 1/60. Hence 60 hours.'),
(2, 2023, 'Aptitude', 'hard', 'Two dice are tossed once. What is the probability of getting an even number on the first die or a total of 8?', '["5/9", "7/12", "1/2", "19/36"]', '5/9', 'P(A or B) = P(A) + P(B) - P(A and B) = (18 + 5 - 3)/36 = 20/36 = 5/9.'),
(3, 2024, 'Aptitude', 'easy', 'What is 15% of 40% of 1500?', '["60", "90", "120", "150"]', '90', '40% of 1500 = 600. 15% of 600 = 90.'),
(6, 2023, 'Aptitude', 'medium', 'A clock is started at noon. By 10 minutes past 5, through how many degrees has the hour hand turned?', '["145°", "150°", "155°", "160°"]', '155°', 'In 310 minutes, angle = 310 * 0.5° = 155°.'),
(6, 2024, 'Technical', 'medium', 'What is the output of the following C code snippet?\nint a = 5;\nprintf("%d %d %d", a++, a, ++a);', '["5 6 7", "Compiler dependent / Undefined behavior", "7 6 7", "6 6 7"]', 'Compiler dependent / Undefined behavior', 'Modifying a variable multiple times without a sequence point causes Undefined Behavior in C.'),
(1, 2024, 'Technical', 'easy', 'Which data structure is primarily used for implementing Breadth First Search (BFS) in a graph?', '["Stack", "Queue", "Priority Queue", "Binary Search Tree"]', 'Queue', 'BFS visits vertices in level order (FIFO), which is implemented using a Queue.'),
(2, 2024, 'Technical', 'medium', 'Which normal form deals with the concept of Multivalued Dependency?', '["1NF", "2NF", "3NF", "4NF"]', '4NF', '4NF eliminates non-trivial multivalued dependencies in relational databases.'),
(4, 2024, 'Technical', 'easy', 'In Object Oriented Programming, which concept refers to the ability to take more than one form?', '["Inheritance", "Encapsulation", "Polymorphism", "Abstraction"]', 'Polymorphism', 'Polymorphism allows objects to take multiple forms through method overriding and overloading.'),
(5, 2023, 'Technical', 'medium', 'Which page replacement algorithm suffers from Belady\'s Anomaly?', '["FIFO", "LRU", "Optimal", "LFU"]', 'FIFO', 'FIFO can cause more page faults when increasing page frame capacity under specific reference patterns.'),
(3, 2024, 'Technical', 'easy', 'What is the worst-case time complexity of QuickSort?', '["O(N log N)", "O(N)", "O(N^2)", "O(log N)"]', 'O(N^2)', 'When pivot selection splits subarrays into size 0 and N-1 repeatedly, time complexity degrades to O(N^2).'),
(6, 2023, 'Technical', 'hard', 'In Java, what happens when an overridden method in a child class throws a broader checked exception than the parent method?', '["Compiles successfully", "Compile-time error: overridden method does not throw Exception", "Runtime Exception", "Warning only"]', 'Compile-time error: overridden method does not throw Exception', 'An overriding method cannot throw broader checked exceptions than the superclass method.'),
(2, 2023, 'Technical', 'medium', 'Which HTTP method is considered idempotent?', '["POST", "PUT", "PATCH", "CONNECT"]', 'PUT', 'PUT replaces target resource state; multiple identical requests have the exact same server side effect.'),
(1, 2023, 'Technical', 'easy', 'What does ACID stand for in the context of DBMS transactions?', '["Atomicity, Consistency, Isolation, Durability", "Access, Control, Integrity, Data", "Authentication, Concurrency, Indexing, Delivery", "Automatic, Continuous, Independent, Direct"]', 'Atomicity, Consistency, Isolation, Durability', 'ACID properties guarantee reliable database transactions.'),
(4, 2023, 'Technical', 'medium', 'What is the default subnet mask for a Class C IP address?', '["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.255"]', '255.255.255.0', 'Class C addresses use 24 bits for network prefix (/24).'),
(1, 2024, 'Verbal', 'easy', 'Choose the word nearest in meaning to: CANDID', '["Dishonest", "Secretive", "Frank / Outspoken", "Shy"]', 'Frank / Outspoken', 'Candid means truthful and straightforward.'),
(2, 2024, 'Verbal', 'medium', 'Identify the error in the sentence: "Neither of the two candidates who applied (A) / for the research role (B) / have cleared the initial round (C) / No error (D)"', '["A", "B", "C", "D"]', 'C', '"Neither" is singular; verb should be "has cleared".'),
(4, 2024, 'Verbal', 'easy', 'Fill in the blank: "She is proficient ______ three programming languages."', '["at", "in", "with", "on"]', 'in', 'The adjective proficient is followed by "in".'),
(6, 2024, 'Verbal', 'medium', 'What is the antonym of the word: EPHEMERAL?', '["Transient", "Eternal / Permanent", "Fleeting", "Fragile"]', 'Eternal / Permanent', 'Ephemeral means short-lived; antonym is eternal or permanent.'),
(3, 2023, 'Verbal', 'easy', 'Select the correctly spelled word:', '["Accomodate", "Accommodate", "Acommodate", "Accommodat"]', 'Accommodate', 'Accommodate has double c and double m.'),
(5, 2024, 'Verbal', 'medium', 'What is the meaning of the idiom: "Burn the midnight oil"?', '["Waste precious resources", "Work or study late into the night", "Create unnecessary trouble", "Cook a midnight meal"]', 'Work or study late into the night', 'Means working or studying diligently into the night.'),
(1, 2023, 'Verbal', 'easy', 'Select the synonym for: BENEVOLENT', '["Cruel", "Generous / Kind", "Selfish", "Lazy"]', 'Generous / Kind', 'Benevolent means kind and charitable.'),
(2, 2023, 'Verbal', 'medium', 'Fill in the blank: "The committee reached ______ unanimous decision after four hours of debate."', '["a", "an", "the", "no article needed"]', 'a', 'Unanimous starts with consonant sound /j/, so "a" is used.'),
(4, 2023, 'Verbal', 'hard', 'Which word describes a person who is indifferent to pleasure or pain?', '["Altruist", "Hedonist", "Stoic", "Epicurean"]', 'Stoic', 'A stoic endures pain or hardship without display of feelings.'),
(6, 2023, 'Verbal', 'medium', 'Change into passive voice: "The chef cooked a delicious meal for the guests."', '["A delicious meal was cooked by the chef for the guests.", "A delicious meal had been cooked by the chef.", "The guests were cooked a meal by the chef.", "A meal is cooked delicious by the chef."]', 'A delicious meal was cooked by the chef for the guests.', 'Simple past passive: was cooked by the chef.'),
(6, 2024, 'Coding', 'hard', 'Given an array of integers, how would you find the equilibrium index where the sum of lower indices equals the sum of higher indices in O(N) time and O(1) space?', '["Compute total sum first, then iterate maintaining left sum and checking right sum as (total - left - current)", "Sort array first and run two pointers from both sides", "Use two nested loops comparing subarray sums at each index", "Push all elements to a stack and pop one by one"]', 'Compute total sum first, then iterate maintaining left sum and checking right sum as (total - left - current)', 'Pre-calculating total sum allows O(1) comparison at every step.'),
(2, 2024, 'Coding', 'medium', 'What is the time complexity to detect a cycle in a linked list using Floyd\'s Cycle Detection (Tortoise and Hare) algorithm?', '["O(N^2)", "O(N)", "O(log N)", "O(1)"]', 'O(N)', 'Slow and fast pointer meet in at most N steps, requiring O(N) time and O(1) space.'),
(1, 2024, 'Logical Reasoning', 'easy', 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?', '["(1/3)", "(1/8)", "(2/8)", "(1/16)"]', '(1/8)', 'Each term is multiplied by 1/2. Next term is (1/4) * (1/2) = 1/8.'),
(4, 2024, 'Logical Reasoning', 'medium', 'Pointing to a photograph, a man said, "I have no brother or sister, but that man\'s father is my father\'s son." Whose photograph was it?', '["His own", "His son\'s", "His father\'s", "His nephew\'s"]', 'His son\'s', '"My father\'s son" is the speaker himself; thus that man\'s father is speaker -> photo is his son.'),
(5, 2024, 'Coding', 'medium', 'Which technique is used to solve the 0/1 Knapsack Problem with integer weights optimally?', '["Greedy Algorithm", "Dynamic Programming", "Divide and Conquer", "Linear Search"]', 'Dynamic Programming', '0/1 Knapsack requires DP because greedy cannot take fractions.'),
(3, 2023, 'Logical Reasoning', 'easy', 'If South-East becomes North, North-East becomes West and so on. What will West become?', '["North-East", "South-East", "North-West", "South-West"]', 'South-East', 'Rotates 135 degrees anti-clockwise. West becomes South-East.'),
(6, 2023, 'Coding', 'hard', 'How can you swap two integers without using a temporary third variable or arithmetic operations?', '["Bitwise XOR: a = a ^ b; b = a ^ b; a = a ^ b;", "Bitwise AND: a = a & b; b = a & b;", "Bitwise OR: a = a | b; b = a | b;", "Not possible without arithmetic or temporary variable"]', 'Bitwise XOR: a = a ^ b; b = a ^ b; a = a ^ b;', 'XOR swap algorithm avoids integer overflow entirely.'),
(1, 2023, 'Coding', 'medium', 'What is the recurrence relation for the Merge Sort algorithm on an array of size N?', '["T(N) = 2T(N/2) + O(N)", "T(N) = T(N-1) + O(N)", "T(N) = 2T(N/2) + O(1)", "T(N) = 4T(N/2) + O(N^2)"]', 'T(N) = 2T(N/2) + O(N)', 'Divides in 2 halves and merges in linear time, yielding O(N log N).'),
(2, 2023, 'Logical Reasoning', 'medium', 'Statements: All mangoes are golden in color. No golden-colored things are cheap. Conclusions: 1) All mangoes are cheap. 2) Golden-colored mangoes are not cheap.', '["Only conclusion 1 follows", "Only conclusion 2 follows", "Either 1 or 2 follows", "Neither follows"]', 'Only conclusion 2 follows', 'Since all golden things are not cheap, golden mangoes cannot be cheap.'),
(4, 2023, 'Coding', 'easy', 'Which string algorithm is best suited for single pattern searching with O(N + M) worst case time complexity?', '["Knuth-Morris-Pratt (KMP) Algorithm", "Brute Force Search", "Binary Search", "Bubble Match"]', 'Knuth-Morris-Pratt (KMP) Algorithm', 'KMP uses preprocessed LPS table to avoid rollback.');

-- -----------------------------------------------------------------------------
-- 13. Tests & Test Questions
-- -----------------------------------------------------------------------------
INSERT INTO `tests` (`id`, `title`, `description`, `category`, `duration_minutes`, `total_marks`, `pass_percentage`, `difficulty`, `max_attempts`, `is_published`) VALUES
(1, 'TCS NQT Foundation Aptitude Mock Test', 'Comprehensive quantitative and analytical aptitude assessment simulating the latest TCS National Qualifier Test pattern.', 'Quantitative Aptitude', 30, 10, 60.00, 'medium', 1, 1),
(2, 'Core Computer Science & Programming Assessment', 'Evaluates fundamental knowledge in Data Structures, Algorithms, DBMS, Operating Systems and Computer Networks.', 'Technical Core', 25, 10, 60.00, 'medium', 1, 1),
(3, 'Verbal Ability & Professional Communication Test', 'Assesses vocabulary, reading comprehension, grammar rules, error spotting, and sentence correction skills.', 'Verbal Ability', 20, 10, 60.00, 'easy', 1, 1);

INSERT INTO `test_questions` (`test_id`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `marks`, `category`, `explanation`) VALUES
(1, 'A car covers a distance of 450 km in 6 hours. What is its speed in meters per second?', '20.83 m/s', '25 m/s', '75 m/s', '12.5 m/s', 'A', 1, 'Quantitative Aptitude', 'Speed = 450/6 = 75 km/h. In m/s = 75 * (5/18) = 20.83 m/s.'),
(1, 'Find the greatest number that will divide 43, 91 and 183 so as to leave the same remainder in each case.', '4', '7', '9', '13', 'A', 1, 'Quantitative Aptitude', 'HCF(91-43, 183-91, 183-43) = HCF(48, 92, 140) = 4.'),
(1, 'If 20% of a = b, then b% of 20 is the same as:', '4% of a', '5% of a', '20% of a', 'None of these', 'A', 1, 'Quantitative Aptitude', 'b = 0.2a. b% of 20 = (0.2a/100)*20 = 4% of a.'),
(1, 'In how many ways can the letters of the word "LEADER" be arranged?', '72', '144', '360', '720', 'C', 1, 'Quantitative Aptitude', '6! / 2! = 720 / 2 = 360.'),
(1, 'A sum of money doubles itself in 10 years at simple interest. What is the rate percentage per annum?', '5%', '10%', '12.5%', '15%', 'B', 1, 'Quantitative Aptitude', 'P = (P * R * 10)/100 => R = 10%.'),
(1, 'The ratio of ages of two friends is 3:5. After 5 years, the ratio becomes 2:3. What is the present age of the elder friend?', '25 years', '20 years', '15 years', '30 years', 'A', 1, 'Quantitative Aptitude', '(3x+5)/(5x+5) = 2/3 => 9x+15 = 10x+10 => x = 5. Elder = 5x = 25 years.'),
(1, 'Find the odd man out: 3, 5, 11, 14, 17, 21', '14', '21', '11', '3', 'A', 1, 'Quantitative Aptitude', '14 is the only even number.'),
(1, 'A man buys a cycle for Rs. 1400 and sells it at a loss of 15%. What is the selling price of the cycle?', 'Rs. 1090', 'Rs. 1160', 'Rs. 1190', 'Rs. 1202', 'C', 1, 'Quantitative Aptitude', 'SP = 85% of 1400 = Rs. 1190.'),
(1, 'A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is:', '7/15', '8/15', '1/2', '1/3', 'B', 1, 'Quantitative Aptitude', 'In 4 days = 4 * (1/15 + 1/20) = 28/60 = 7/15. Left = 8/15.'),
(1, 'The diagonal of a square is 4√2 cm. What is the area of the square?', '8 sq. cm', '16 sq. cm', '32 sq. cm', '64 sq. cm', 'B', 1, 'Quantitative Aptitude', 'Side = 4 cm. Area = 16 sq. cm.'),
(2, 'Which data structure is best suited for implementing an LRU Cache?', 'Array and Stack', 'Hash Map and Doubly Linked List', 'Binary Heap', 'Queue and Array', 'B', 1, 'Technical Core', 'Hash Map provides O(1) lookup; Doubly Linked List enables O(1) removal/insertion.'),
(2, 'What is the primary objective of Database Normalization?', 'Increase redundancy', 'Eliminate anomalies and minimize redundancy', 'Speed up all join operations', 'Enforce table partitioning', 'B', 1, 'Technical Core', 'Normalization eliminates insert/update/delete anomalies and duplicate data.'),
(2, 'In Operating Systems, what are the four necessary conditions for a Deadlock?', 'Mutual exclusion, Hold and wait, No preemption, Circular wait', 'Swapping, Paging, Segmentation, Thrashing', 'Race condition, Critical section, Semaphore, Mutex', 'Read, Write, Execute, Delete', 'A', 1, 'Technical Core', 'Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.'),
(2, 'What layer of the OSI model does the TCP protocol operate on?', 'Network Layer', 'Transport Layer', 'Session Layer', 'Data Link Layer', 'B', 1, 'Technical Core', 'TCP is a Layer 4 Transport Layer protocol.'),
(2, 'What is the time complexity to search for an element in a balanced Binary Search Tree (AVL / Red-Black)?', 'O(1)', 'O(log N)', 'O(N)', 'O(N log N)', 'B', 1, 'Technical Core', 'Balanced BSTs maintain O(log N) height.'),
(2, 'In SQL, which clause is used to filter records resulting from an aggregate GROUP BY query?', 'WHERE', 'ORDER BY', 'HAVING', 'LIMIT', 'C', 1, 'Technical Core', 'HAVING filters aggregate values after grouping.'),
(2, 'What is the function of the ARP (Address Resolution Protocol)?', 'Map Domain Names to IP Addresses', 'Map IP Addresses to MAC (Hardware) Addresses', 'Secure Transport Layer data', 'Assign dynamic IP addresses', 'B', 1, 'Technical Core', 'ARP maps network IP addresses to data link MAC addresses.'),
(2, 'Which sorting algorithm is guaranteed to be stable and run in O(N log N) worst-case time?', 'QuickSort', 'HeapSort', 'MergeSort', 'SelectionSort', 'C', 1, 'Technical Core', 'MergeSort guarantees stability and O(N log N) in all cases.'),
(2, 'What is Thrashing in Virtual Memory management?', 'CPU executes instructions at peak frequency', 'System spends more time swapping pages than executing user processes', 'A process is killed due to memory limits', 'Disk defragmentation is underway', 'B', 1, 'Technical Core', 'Thrashing happens when excessive page faulting occupies CPU with disk I/O swapping.'),
(2, 'In Git, what does `git merge --squash` do?', 'Deletes all commit history on main branch', 'Combines all feature branch commits into a single staged commit', 'Reverts the last 5 commits', 'Force pushes changes to origin', 'B', 1, 'Technical Core', 'Squash merge condenses all commits into a single unified commit.'),
(3, 'Choose the word that is opposite in meaning to "PRAGMATIC":', 'Practical', 'Idealistic / Unrealistic', 'Sensible', 'Hardworking', 'B', 1, 'Verbal Ability', 'Pragmatic means practical; antonym is idealistic.'),
(3, 'Choose the correct passive form: "The manager approved our project proposal."', 'Our project proposal is approved by the manager.', 'Our project proposal was approved by the manager.', 'Our project proposal has been approved.', 'Our project proposal had approved the manager.', 'B', 1, 'Verbal Ability', 'Simple past passive is "was approved".'),
(3, 'Select the synonym for "TENACIOUS":', 'Weak', 'Persistent / Determined', 'Hesitant', 'Gentle', 'B', 1, 'Verbal Ability', 'Tenacious means persistent and determined.'),
(3, 'Complete the sentence: "Despite ______ tired, she continued to prepare for the test."', 'she was', 'being', 'of being', 'having', 'B', 1, 'Verbal Ability', 'Despite is followed by gerund "being".'),
(3, 'Identify the wrongly spelled word:', 'Supercede', 'Maintenance', 'Privilege', 'Conscientious', 'A', 1, 'Verbal Ability', 'Correct spelling is Supersede.'),
(3, 'What does the idiom "A blessing in disguise" mean?', 'A gift wrapped secretly', 'Something good that seemed bad at first', 'A prayer that went unanswered', 'A dishonest compliment', 'B', 1, 'Verbal Ability', 'Something good that was not recognized at first.'),
(3, 'Fill in the blank: "Neither the teacher nor the students ______ present in the lab."', 'was', 'were', 'is', 'are not', 'B', 1, 'Verbal Ability', 'Verb agrees with the nearer plural subject "students" -> "were".'),
(3, 'Select the word that best fits: "A doctor who specializes in skin diseases is a ______."', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician', 'B', 1, 'Verbal Ability', 'Dermatologists specialize in skin.'),
(3, 'Fill in the preposition: "He is senior ______ me by two years."', 'than', 'to', 'from', 'with', 'B', 1, 'Verbal Ability', 'Senior takes preposition "to".'),
(3, 'Choose the correct word: "The ______ of the pandemic was felt across all industries."', 'Affect', 'Effect', 'Affective', 'Effecting', 'B', 1, 'Verbal Ability', '"Effect" is the noun denoting result or consequence.');

-- -----------------------------------------------------------------------------
-- 14. Daily Challenge
-- -----------------------------------------------------------------------------
INSERT INTO `daily_challenges` (`id`, `challenge_date`, `title`, `points`) VALUES
(1, CURDATE(), 'Today\'s Algorithmic Challenge: Array Inversions & Bitwise', 15)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

INSERT INTO `challenge_questions` (`id`, `challenge_id`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `explanation`) VALUES
(1, 1, 'What is the result of the bitwise expression `(x & (x - 1))` for any positive integer `x`?', 'Multiplies x by 2', 'Clears the lowest set bit in x', 'Sets all bits to 1', 'Inverts all odd bits', 'B', '`(x & (x - 1))` is a classic bit manipulation trick that unsets (clears) the rightmost set bit in binary representation of x.')
ON DUPLICATE KEY UPDATE `question_text` = VALUES(`question_text`);

-- -----------------------------------------------------------------------------
-- 15. Vocabulary (30 Words)
-- -----------------------------------------------------------------------------
INSERT INTO `vocabulary` (`word`, `pronunciation`, `part_of_speech`, `definition`, `example_sentence`, `synonyms`, `antonyms`, `difficulty`) VALUES
('Pragmatic', '/præɡˈmætɪk/', 'Adjective', 'Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.', 'The engineering team took a pragmatic approach to meet the tight deadline.', 'Practical, sensible, down-to-earth', 'Idealistic, impractical', 'medium'),
('Mitigate', '/ˈmɪtɪɡeɪt/', 'Verb', 'Make less severe, serious, or painful; alleviate.', 'Load balancing helps mitigate the impact of sudden spikes in traffic.', 'Alleviate, reduce, lessen', 'Aggravate, intensify', 'medium'),
('Meticulous', '/mɪˈtɪkjʊləs/', 'Adjective', 'Showing great attention to detail; very careful and precise.', 'Her meticulous code reviews helped prevent multiple security flaws in production.', 'Diligent, scrupulous, thorough', 'Careless, sloppy', 'medium'),
('Pernicious', '/pəˈnɪʃəs/', 'Adjective', 'Having a harmful effect, especially in a gradual or subtle way.', 'Memory leaks have a pernicious effect on server performance over time.', 'Harmful, damaging, destructive', 'Beneficial, harmless', 'hard'),
('Ubiquitous', '/juːˈbɪkwɪtəs/', 'Adjective', 'Present, appearing, or found everywhere.', 'Cloud computing has become ubiquitous in modern software engineering.', 'Omnipresent, universal, pervasive', 'Rare, scarce', 'medium'),
('Ephemeral', '/ɪˈfɛmərəl/', 'Adjective', 'Lasting for a very short time.', 'Serverless containers often exist as ephemeral instances created on demand.', 'Transitory, brief, fleeting', 'Permanent, enduring', 'hard'),
('Resilient', '/rɪˈzɪlɪənt/', 'Adjective', 'Able to withstand or recover quickly from difficult conditions.', 'The microservices cluster is resilient against individual node outages.', 'Tough, adaptable, flexible', 'Fragile, vulnerable', 'easy'),
('Cognizant', '/ˈkɒɡnɪzənt/', 'Adjective', 'Having knowledge or being aware of something.', 'Engineers must remain cognizant of data privacy laws while logging telemetry.', 'Aware, conscious, mindful', 'Ignorant, unaware', 'medium'),
('Ambiguous', '/æmˈbɪɡjuəs/', 'Adjective', 'Open to more than one interpretation; having a double meaning.', 'The project specifications were ambiguous, leading to conflicting implementations.', 'Equivocal, obscure, vague', 'Clear, unambiguous', 'easy'),
('Anomaly', '/əˈnɒməli/', 'Noun', 'Something that deviates from what is standard, normal, or expected.', 'The automated monitoring system flagged an anomaly in CPU utilization.', 'Oddity, irregularity, deviation', 'Norm, conformity', 'easy'),
('Fastidious', '/fæˈstɪdɪəs/', 'Adjective', 'Very attentive to and concerned about accuracy and detail.', 'He is fastidious about maintaining unit test coverage above 90 percent.', 'Punctilious, particular, exacting', 'Uncritical, easygoing', 'hard'),
('Eloquent', '/ˈɛləkwənt/', 'Adjective', 'Fluent or persuasive in speaking or writing.', 'Her eloquent defense of the system design impressed the interviewing panel.', 'Articulate, fluent, expressive', 'Inarticulate, tongue-tied', 'easy'),
('Lucid', '/ˈluːsɪd/', 'Adjective', 'Expressed clearly; easy to understand.', 'The API documentation is lucid and includes step-by-step examples.', 'Intelligible, clear, transparent', 'Confusing, murky', 'easy'),
('Prolific', '/prəˈlɪfɪk/', 'Adjective', 'Producing much fruit or foliage or many works of result.', 'He is a prolific open source developer with over fifty active libraries.', 'Productive, creative, fertile', 'Unproductive, barren', 'medium'),
('Superfluous', '/suːˈpɜːrluəs/', 'Adjective', 'Unnecessary, especially through being more than enough.', 'Refactoring removed superfluous loops and redundant database calls.', 'Redundant, excess, needless', 'Essential, necessary', 'hard'),
('Tenacious', '/tɪˈneɪʃəs/', 'Adjective', 'Tending to keep a firm hold of something; clinging or adhering closely.', 'Her tenacious debugging uncovered a race condition that puzzled the senior team for weeks.', 'Persevering, dogged, resolute', 'Irresolute, yielding', 'medium'),
('Alacrity', '/əˈlækrɪti/', 'Noun', 'Brisk and cheerful readiness.', 'The junior engineer accepted the challenge with enthusiasm and alacrity.', 'Eagerness, willingness, readiness', 'Apathy, reluctance', 'hard'),
('Candid', '/ˈkændɪd/', 'Adjective', 'Truthful and straightforward; frank.', 'In the post-mortem meeting, we had a candid conversation about the deployment outage.', 'Frank, honest, direct', 'Guarded, secretive', 'easy'),
('Exemplary', '/ɪɡˈzɛmpləri/', 'Adjective', 'Serving as a desirable model; representing the best of its kind.', 'The student received an offer due to an exemplary academic and project portfolio.', 'Commendable, model, stellar', 'Deplorable, substandard', 'medium'),
('Futile', '/ˈfjuːtaɪl/', 'Adjective', 'Incapable of producing any useful result; pointless.', 'Attempting to patch unencrypted legacy protocols proved futile.', 'Fruitless, useless, in vain', 'Fruitful, effective', 'easy'),
('Impeccable', '/ɪmˈpɛkəbl/', 'Adjective', 'In accordance with the highest standards; faultless.', 'His background check and academic track record were impeccable.', 'Flawless, spotless, pristine', 'Defective, flawed', 'medium'),
('Ingenious', '/ɪnˈdʒiːniəs/', 'Adjective', 'Clever, original, and inventive.', 'She designed an ingenious caching algorithm that reduced memory overhead by half.', 'Inventive, creative, resourceful', 'Unimaginative, clumsy', 'medium'),
('Juxtapose', '/ˌdʒʌkstəˈpəʊz/', 'Verb', 'Place or deal with close together for contrasting effect.', 'The presentation juxtaposed monolith architecture against modern serverless microservices.', 'Compare, contrast, correlate', 'Isolate, separate', 'hard'),
('Kudos', '/ˈkjuːdɒs/', 'Noun', 'Praise and honor received for an achievement.', 'The placement cell gave kudos to the students for securing 100 percent offers in TCS Digital.', 'Accolades, compliments, praise', 'Criticism, blame', 'easy'),
('Laudable', '/ˈlɔːdəbl/', 'Adjective', 'Deserving praise and commendation.', 'Their initiative to mentor underrepresented students in competitive coding is laudable.', 'Praiseworthy, admirable, noble', 'Blameworthy, shameful', 'medium'),
('Magnanimous', '/mæɡˈnænɪməs/', 'Adjective', 'Generous or forgiving, especially toward a rival or less powerful person.', 'The competition winner was magnanimous in sharing credit with her team.', 'Generous, benevolent, charitable', 'Petty, vindictive', 'hard'),
('Nefarious', '/nɪˈfɛəriəs/', 'Adjective', 'Wicked, criminal, or villainous.', 'The security team detected nefarious packets attempting SQL injection on the gateway.', 'Heinous, evil, vile', 'Virtuous, ethical', 'hard'),
('Opulent', '/ˈɒpjʊlənt/', 'Adjective', 'Ostentatiously rich and luxurious or lavish.', 'The company welcomed the new recruits with an opulent onboarding orientation.', 'Luxurious, affluent, grand', 'Austere, poor', 'medium'),
('Paradox', '/ˈpærədɒks/', 'Noun', 'A seemingly absurd or self-contradictory statement that when investigated may prove to be well founded or true.', 'The software paradox is that more features can sometimes lead to reduced user productivity.', 'Contradiction, anomaly, enigma', 'Certainty, consistency', 'easy'),
('Quell', '/kwɛl/', 'Verb', 'Put an end to a rebellion or other disorder, typically by the use of force; suppress or subdue.', 'A timely status page update helped quell student panic during registration server downtime.', 'Suppress, subdue, extinguish', 'Instigate, inflame', 'medium')
ON DUPLICATE KEY UPDATE `definition` = VALUES(`definition`);

-- -----------------------------------------------------------------------------
-- 16. Interview Experiences (6 Detailed Articles)
-- -----------------------------------------------------------------------------
INSERT INTO `interview_experiences` (`company_id`, `author_name`, `role_title`, `batch_year`, `verdict`, `difficulty`, `rounds_count`, `content`, `tips`) VALUES
(6, 'Siddharth Natarajan (Batch 2024)', 'Member Technical Staff', 2024, 'Selected', 'hard', 5, 'Campus Drive Experience - Zoho MTS Role\nRound 1 was a paper/online test of 90 minutes. 20 Aptitude questions and 15 C-programming outputs. Focus heavily on pointers, recursion, and pre-increment/post-increment subtleties.\nRound 2: Basic Programming (5 questions). Problems included: Spiral matrix traversal, String compression (e.g., a3b2 -> aaabb), and finding valid subsets.\nRound 3: Advanced Machine Coding (3 hours). We were asked to implement a Console-based Railway Reservation System with waiting lists, RAC berths, and cancellation mechanics. Clean OOP principles, modular classes, and handling edge cases were paramount.\nRound 4: Technical Interview with a Lead Architect. He reviewed my Round 3 code line by line, asked me to refactor one module to handle thread-safe bookings, and grilled me on B-Tree indexing.\nRound 5: HR Interview. Why Zoho? Salary expectations, willingness to relocate to Tenkasi/Chennai. Received the offer on the same night!', 'Do not use built-in language sorting or high-level library functions during Round 2 and 3. Zoho values deep understanding of pointers, array manipulations, and memory management from scratch in C or Java.'),
(1, 'Aishwarya R (Batch 2024)', 'TCS Digital Cadre', 2024, 'Selected', 'medium', 3, 'TCS NQT Digital On-Campus Experience\nThe test was conducted on the TCS iON platform.\nPart A: Cognitive (Advanced Numerical, Advanced Verbal, Advanced Reasoning). 40 questions in 50 minutes. Speed was critical.\nPart B: Advanced Coding. 2 problems. Question 1 was an array rotation problem with dynamic queries. Question 2 was a Dynamic Programming problem (variation of Coin Change). I passed all test cases for Q1 and 8/10 test cases for Q2.\nInterview: A 45-minute virtual panel with 3 interviewers (Technical, Managerial, HR). Asked about my final year project on Kubernetes and distributed storage, difference between Inner and Left joins, and ACID properties with real banking examples.', 'Time management in NQT is everything. Don\'t get stuck on one numeric calculation. For the coding section, ensure you write code that handles large constraints (use long long in C++ or BigInteger/long in Java).'),
(2, 'Dinesh Balasubramanian (Batch 2024)', 'Specialist Programmer (Power Programmer)', 2024, 'Selected', 'hard', 3, 'HackWithInfy / Specialist Programmer Interview\nI qualified through HackWithInfy round 2 where I solved 2 out of 3 hard problems (Segment Trees and Dijkstra with state).\nTechnical Interview: Lasted 1 hour and 15 minutes. The interviewer asked me to open an IDE and live-code:\n1. Longest Valid Parentheses substring in O(N) time and O(1) space.\n2. Design a thread-safe Singleton pattern in Java with Double-Checked Locking and explain the need for the `volatile` keyword.\n3. System Design: How would you design a distributed URL Shortener (Bitly) handling 100M daily clicks?\nThe interviewer was extremely collaborative and guided me whenever I hesitated on hash collisions.', 'Specialist Programmer roles demand strong knowledge of Advanced Data Structures (Trie, Segment Trees, Disjoint Set Union) and low-level concurrency mechanisms.'),
(4, 'Rohit Verma (Batch 2024)', 'Advanced Application Engineering Analyst', 2024, 'Selected', 'medium', 4, 'Accenture Full Assessment Journey\nAssessment 1: Cognitive + Technical MCQs. Questions on pseudocode, MS Office, cloud fundamentals, and critical thinking. If you clear the cut-off, you immediately unlock Assessment 2 (Coding) within 10 minutes.\nAssessment 2 (Coding): 2 questions in 45 minutes. Q1: Palindrome string transformations. Q2: Bitwise manipulation on an integer array. Cleared both.\nAssessment 3: Communication Assessment (Automated Voice Interview). You hear prompts and must repeat sentences, speak on given topics for 1 minute, and retell short stories.\nAssessment 4: HR + Technical Panel Interview. Discussion on strengths, weaknesses, project leadership conflicts, and a quick query on indexing in MongoDB.', 'Use a high-quality wired headset for the communication test in a completely silent room. Even minor background noise can hurt the automated scoring engine.'),
(5, 'Meera Krishnan (Batch 2024)', 'GenC Elevate', 2024, 'Selected', 'medium', 3, 'Cognizant GenC Elevate Assessment\nRound 1 had Quantitative, Analytical, and Code Debugging. Code debugging required finding semantic errors in 7 code blocks in 20 minutes.\nRound 2: Coding Assessment (2 questions). One was an SQL query involving multiple joins with `DENSE_RANK()` and the second was a 2D array matrix path counting question.\nFinal Interview: 30 minutes. The interviewer asked about REST API status codes (200, 201, 400, 401, 403, 500), difference between process and thread, and why I chose React over traditional templates for my portfolio project.', 'Review SQL window functions (ROW_NUMBER, RANK, DENSE_RANK) as Cognizant frequently includes at least one database query challenge.'),
(3, 'Harish Venkat (Batch 2024)', 'Wipro Elite / Turbo', 2024, 'Selected', 'easy', 3, 'Wipro National Talent Hunt Experience\nRound 1: 3 sections. Aptitude, Written Communication (Essay writing on topic: "Impact of Artificial Intelligence on Manufacturing Jobs"), and 2 coding questions. The essay requires proper grammar, no spelling errors, and around 200-250 words.\nRound 2: Technical Interview. 25 minutes. Asked to write a program to check for Anagram strings. Asked basic questions about normalization, primary vs unique key, and explain Polymorphism with a real-world vehicle example.\nRound 3: HR Interview. Document verification, night shifts and rotational shift agreement.', 'Do not use backspace excessively in the essay writing tool; plan your thoughts before typing. Focus on clear grammar and simple vocabulary.');

-- -----------------------------------------------------------------------------
-- 17. Learning Videos (12 Curated Videos)
-- -----------------------------------------------------------------------------
INSERT INTO `videos` (`title`, `description`, `category`, `difficulty`, `youtube_url`, `duration`) VALUES
('Time and Work - Complete Formula & Shortcut Tricks', 'Master all shortcut formulas for Unitary method, Pipes & Cisterns, and Alternating Days work problems.', 'Quantitative Aptitude', 'easy', 'https://www.youtube.com/watch?v=KE7tQf9spPg', '28:15'),
('Permutations & Combinations Explained Visually', 'Detailed breakdown of combination vs permutation, circular arrangements, and repetition rules.', 'Quantitative Aptitude', 'medium', 'https://www.youtube.com/watch?v=XqQTXW7XfYA', '35:40'),
('Probability Rules & Bayes Theorem for Placement Tests', 'Solve conditional probability, independent events, and dice/card problems with zero confusion.', 'Quantitative Aptitude', 'hard', 'https://www.youtube.com/watch?v=R13BD8qKeTg', '42:10'),
('DBMS Full Course - From ER Diagrams to Normalization & SQL', 'Complete review of Relational Algebra, SQL queries, Indexing (B-Trees), and 1NF to BCNF.', 'Technical Concepts', 'easy', 'https://www.youtube.com/watch?v=HXV3zeQKqGY', '55:20'),
('Operating Systems - Concurrency, Deadlocks & Memory Management', 'Understand semaphores, mutexes, virtual memory paging, thrashing and CPU scheduling algorithms.', 'Technical Concepts', 'medium', 'https://www.youtube.com/watch?v=vBURTt97EkA', '48:30'),
('Computer Networks - OSI Model & TCP/IP Protocol Suite in 1 Shot', 'Covers DNS, HTTP/HTTPS, TCP 3-way handshake, Subnetting calculations, and routing protocols.', 'Technical Concepts', 'medium', 'https://www.youtube.com/watch?v=IPvYjXCsTg8', '50:15'),
('Top 10 Dynamic Programming Patterns for Coding Interviews', 'Detailed walkthrough of 0/1 Knapsack, Longest Common Subsequence, and Matrix Chain Multiplication.', 'Coding Interview', 'hard', 'https://www.youtube.com/watch?v=oBt53YbR9Kk', '62:00'),
('Graph Algorithms: BFS, DFS, Dijkstra & Topological Sort', 'Step-by-step code implementation in Java & C++ with adjacency list and cycle detection.', 'Coding Interview', 'hard', 'https://www.youtube.com/watch?v=tWVWeAqZ0WU', '58:45'),
('Two Pointers and Sliding Window Coding Techniques', 'Solve subarray and string window problems in linear O(N) time complexity.', 'Coding Interview', 'easy', 'https://www.youtube.com/watch?v=jM2dhDPYMQM', '32:20'),
('How to Answer "Tell Me About Yourself" in Placement Interviews', 'Craft a compelling 90-second professional elevator pitch highlighting projects and achievements.', 'HR Prep', 'easy', 'https://www.youtube.com/watch?v=kayOhGRgk84', '18:10'),
('STAR Method for Behavioral & Situational Questions', 'Situation, Task, Action, Result framework for answering leadership, failure, and teamwork questions.', 'HR Prep', 'medium', 'https://www.youtube.com/watch?v=0kI_g_m9X_s', '22:45'),
('Salary Negotiation & Offer Letter Evaluation for Freshers', 'Understand CTC breakdown, fixed vs variable pay, bond clauses, and joining formalities.', 'HR Prep', 'easy', 'https://www.youtube.com/watch?v=YwL3Q5w09X8', '19:30');

-- -----------------------------------------------------------------------------
-- 18. Resources (6 PDF Notes & Formula Sheets)
-- -----------------------------------------------------------------------------
INSERT INTO `resources` (`title`, `category`, `file_url`, `file_type`, `description`) VALUES
('Master Placement Resume Template (ATS-Optimized LaTeX & Word)', 'Resume Templates', '/uploads/resumes/sample_ats_resume_template.pdf', 'PDF', 'Single-page battle-tested template rated 95+ on leading ATS scanners. Includes sample bullet points with metrics.'),
('Complete Quantitative Aptitude Formula Cheat Sheet (All Topics)', 'Aptitude Formulas', '/uploads/resumes/aptitude_formula_handbook.pdf', 'PDF', 'Condensed 12-page PDF containing all formulas, shortcuts and tables for Speed Math, P&C, Time-Distance, and Geometry.'),
('Core Operating Systems Revision Notes & Interview Q&A', 'Core CS Notes', '/uploads/resumes/os_interview_notes.pdf', 'PDF', 'Concise summary of process synchronization, Peterson algorithm, deadlock avoidance (Banker\'s algorithm), and paging.'),
('Database Management Systems & SQL Query Handbook', 'Core CS Notes', '/uploads/resumes/dbms_sql_handbook.pdf', 'PDF', '50 most frequently asked SQL interview queries, indexing architectures, transactions, and ACID isolation levels.'),
('Data Structures & Algorithms 75 Most Important Interview Patterns', 'Interview Cheat Sheets', '/uploads/resumes/dsa_patterns_guide.pdf', 'PDF', 'Visual roadmap of blind 75 problems categorized by pattern with pseudocode and time/space complexity analysis.'),
('Top 50 Behavioral & HR Interview Questions with Sample Answers', 'HR Question Bank', '/uploads/resumes/hr_interview_handbook.pdf', 'PDF', 'Frameworks and winning answers for conflict resolution, gap justification, strengths/weaknesses, and company fitment.');

-- -----------------------------------------------------------------------------
-- 19. Notifications
-- -----------------------------------------------------------------------------
INSERT INTO `notifications` (`student_id`, `title`, `message`, `type`, `link`, `is_read`) VALUES
(NULL, 'New Placement Drive: Zoho Corporation (MTS Role - 8.5 LPA)', 'Zoho Corporation has announced their campus drive for Software Development (MTS). Applications are now open for CSE, IT, AIDS, ECE branches. Deadline: Oct 10.', 'new_company', '/student/companies', 0),
(NULL, 'Application Deadline Approaching: TCS Digital (7.5 LPA)', 'Only 3 days left to submit your application for the TCS Digital Cadre campus drive. Verify your academic criteria and apply now.', 'deadline_approaching', '/student/companies', 0),
(NULL, 'New Mock Test Available: TCS NQT Foundation Aptitude', 'A new 30-minute timed mock test matching the latest TCS NQT pattern has been published. Practice to assess your speed and accuracy.', 'new_test', '/student/tests', 0),
(NULL, 'Today\'s Daily Challenge is Live! Earn 15 Points', 'Solve today\'s bitwise algorithm challenge to keep your daily streak alive and climb the placement readiness leaderboard.', 'daily_challenge', '/student/challenges', 0),
(1, 'Application Status Update: Shortlisted for TCS Digital', 'Congratulations Arun! Your profile has been shortlisted for Round 1 of the TCS Digital placement drive.', 'status_change', '/student/applications', 0),
(2, 'Interview Scheduled: Zoho Corporation MTS', 'Hi Priya, you have been invited to the Technical Interview round for Zoho Corporation on Oct 16th.', 'status_change', '/student/applications', 0);

SET FOREIGN_KEY_CHECKS = 1;

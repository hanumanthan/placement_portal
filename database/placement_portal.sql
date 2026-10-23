-- =============================================================================
-- Campus Placement Portal - Database Schema (MySQL 8 / MariaDB)
-- Database Name: placement_portal
-- Tagline: Prepare. Apply. Get Placed.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `placement_portal`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `placement_portal`;

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. Departments Lookup Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(120) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Admins Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin') NOT NULL DEFAULT 'admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_admin_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Students Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `register_number` VARCHAR(50) NOT NULL UNIQUE,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `department` VARCHAR(20) NOT NULL,
  `course` VARCHAR(50) NOT NULL DEFAULT 'B.Tech',
  `batch` VARCHAR(20) NOT NULL DEFAULT '2021-2025',
  `graduation_year` INT NOT NULL DEFAULT 2025,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `role` ENUM('student') NOT NULL DEFAULT 'student',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_student_regno` (`register_number`),
  INDEX `idx_student_email` (`email`),
  INDEX `idx_student_dept` (`department`),
  INDEX `idx_student_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Student Profiles Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `student_profiles`;
CREATE TABLE `student_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL UNIQUE,
  `cgpa` DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
  `tenth_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `twelfth_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `diploma_percentage` DECIMAL(5, 2) NULL,
  `standing_arrears` INT NOT NULL DEFAULT 0,
  `history_arrears` INT NOT NULL DEFAULT 0,
  `resume_url` VARCHAR(255) NULL,
  `photo_url` VARCHAR(255) NULL,
  `github_url` VARCHAR(255) NULL,
  `linkedin_url` VARCHAR(255) NULL,
  `portfolio_url` VARCHAR(255) NULL,
  `bio` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_profile_cgpa` (`cgpa`),
  INDEX `idx_profile_standing_arrears` (`standing_arrears`),
  CONSTRAINT `fk_profile_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. Student Skills Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `student_skills`;
CREATE TABLE `student_skills` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `skill_name` VARCHAR(60) NOT NULL,
  `proficiency` ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'intermediate',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_student_skill` (`student_id`, `skill_name`),
  INDEX `idx_skill_name` (`skill_name`),
  CONSTRAINT `fk_skills_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. Companies Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL UNIQUE,
  `logo_url` VARCHAR(255) NULL,
  `website` VARCHAR(255) NULL,
  `industry` VARCHAR(100) NOT NULL DEFAULT 'Information Technology',
  `headquarters` VARCHAR(150) NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_company_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. Placement Drives Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `placement_drives`;
CREATE TABLE `placement_drives` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `job_title` VARCHAR(150) NOT NULL,
  `job_description` TEXT NOT NULL,
  `location` VARCHAR(150) NOT NULL,
  `employment_type` ENUM('Full-time', 'Internship', 'Internship + PPO') NOT NULL DEFAULT 'Full-time',
  `package_lpa` DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
  `stipend_monthly` DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
  `drive_date` DATE NOT NULL,
  `application_deadline` DATETIME NOT NULL,
  `eligible_departments` TEXT NOT NULL COMMENT 'Comma-separated department codes e.g. CSE,IT,ECE',
  `min_cgpa` DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
  `min_tenth_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `min_twelfth_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `max_standing_arrears` INT NOT NULL DEFAULT 0,
  `max_history_arrears` INT NOT NULL DEFAULT 0,
  `required_skills` TEXT NULL COMMENT 'Comma-separated skills e.g. Java, Python, SQL',
  `official_apply_link` VARCHAR(255) NULL,
  `instructions` TEXT NULL,
  `status` ENUM('draft', 'published', 'ongoing', 'completed', 'cancelled') NOT NULL DEFAULT 'published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_drive_company` (`company_id`),
  INDEX `idx_drive_date` (`drive_date`),
  INDEX `idx_drive_deadline` (`application_deadline`),
  INDEX `idx_drive_status` (`status`),
  CONSTRAINT `fk_drive_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. Drive Rounds Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `drive_rounds`;
CREATE TABLE `drive_rounds` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `drive_id` INT NOT NULL,
  `round_number` INT NOT NULL,
  `round_name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `round_date` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_round_drive` (`drive_id`),
  CONSTRAINT `fk_rounds_drive` FOREIGN KEY (`drive_id`) REFERENCES `placement_drives` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. Applications Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `applications`;
CREATE TABLE `applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `drive_id` INT NOT NULL,
  `status` ENUM('Interested', 'Applied', 'Shortlisted', 'Test Completed', 'Interview', 'Selected', 'Rejected', 'Withdrawn') NOT NULL DEFAULT 'Interested',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_student_drive_app` (`student_id`, `drive_id`),
  INDEX `idx_app_student` (`student_id`),
  INDEX `idx_app_drive` (`drive_id`),
  INDEX `idx_app_status` (`status`),
  CONSTRAINT `fk_app_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_app_drive` FOREIGN KEY (`drive_id`) REFERENCES `placement_drives` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. Company History Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `company_history`;
CREATE TABLE `company_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `year` INT NOT NULL,
  `total_appeared` INT NOT NULL DEFAULT 0,
  `total_selected` INT NOT NULL DEFAULT 0,
  `highest_package` DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
  `average_package` DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_history_company` (`company_id`),
  INDEX `idx_history_year` (`year`),
  CONSTRAINT `fk_history_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. Previous Questions Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `previous_questions`;
CREATE TABLE `previous_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NULL,
  `year` INT NOT NULL,
  `category` ENUM('Aptitude', 'Technical', 'Verbal', 'Coding', 'Logical Reasoning') NOT NULL,
  `difficulty` ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  `question_text` TEXT NOT NULL,
  `options` TEXT NULL COMMENT 'JSON array of choices e.g. ["A", "B", "C", "D"]',
  `correct_answer` TEXT NOT NULL,
  `explanation` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_pq_company` (`company_id`),
  INDEX `idx_pq_category` (`category`),
  INDEX `idx_pq_difficulty` (`difficulty`),
  INDEX `idx_pq_year` (`year`),
  CONSTRAINT `fk_pq_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 12. Interview Experiences Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `interview_experiences`;
CREATE TABLE `interview_experiences` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `student_id` INT NULL,
  `author_name` VARCHAR(120) NOT NULL,
  `role_title` VARCHAR(120) NOT NULL,
  `batch_year` INT NOT NULL,
  `verdict` ENUM('Selected', 'Rejected') NOT NULL,
  `difficulty` ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  `rounds_count` INT NOT NULL DEFAULT 3,
  `content` TEXT NOT NULL,
  `tips` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ie_company` (`company_id`),
  INDEX `idx_ie_verdict` (`verdict`),
  INDEX `idx_ie_difficulty` (`difficulty`),
  CONSTRAINT `fk_ie_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ie_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 13. Tests Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `tests`;
CREATE TABLE `tests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'General Aptitude',
  `duration_minutes` INT NOT NULL DEFAULT 30,
  `total_marks` INT NOT NULL DEFAULT 30,
  `pass_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 60.00,
  `difficulty` ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  `max_attempts` INT NOT NULL DEFAULT 1,
  `is_published` BOOLEAN NOT NULL DEFAULT TRUE,
  `schedule_start` DATETIME NULL,
  `schedule_end` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_test_published` (`is_published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 14. Test Questions Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `test_questions`;
CREATE TABLE `test_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `test_id` INT NOT NULL,
  `question_text` TEXT NOT NULL,
  `option_a` VARCHAR(255) NOT NULL,
  `option_b` VARCHAR(255) NOT NULL,
  `option_c` VARCHAR(255) NOT NULL,
  `option_d` VARCHAR(255) NOT NULL,
  `correct_option` ENUM('A', 'B', 'C', 'D') NOT NULL,
  `marks` INT NOT NULL DEFAULT 1,
  `category` VARCHAR(50) NOT NULL DEFAULT 'Aptitude',
  `explanation` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_tq_test` (`test_id`),
  CONSTRAINT `fk_tq_test` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 15. Test Attempts Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `test_attempts`;
CREATE TABLE `test_attempts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `test_id` INT NOT NULL,
  `started_at` DATETIME NOT NULL,
  `submitted_at` DATETIME NULL,
  `score` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `percentage` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `total_questions` INT NOT NULL DEFAULT 0,
  `correct_answers` INT NOT NULL DEFAULT 0,
  `wrong_answers` INT NOT NULL DEFAULT 0,
  `skipped_answers` INT NOT NULL DEFAULT 0,
  `status` ENUM('in_progress', 'completed', 'timed_out') NOT NULL DEFAULT 'in_progress',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ta_student` (`student_id`),
  INDEX `idx_ta_test` (`test_id`),
  INDEX `idx_ta_status` (`status`),
  CONSTRAINT `fk_ta_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ta_test` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 16. Test Answers Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `test_answers`;
CREATE TABLE `test_answers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `attempt_id` INT NOT NULL,
  `question_id` INT NOT NULL,
  `selected_option` ENUM('A', 'B', 'C', 'D') NULL,
  `is_correct` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_flagged` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ans_attempt` (`attempt_id`),
  INDEX `idx_ans_question` (`question_id`),
  CONSTRAINT `fk_ans_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `test_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ans_question` FOREIGN KEY (`question_id`) REFERENCES `test_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 17. Daily Challenges Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `daily_challenges`;
CREATE TABLE `daily_challenges` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `challenge_date` DATE NOT NULL UNIQUE,
  `title` VARCHAR(150) NOT NULL,
  `points` INT NOT NULL DEFAULT 10,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_challenge_date` (`challenge_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 18. Challenge Questions Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `challenge_questions`;
CREATE TABLE `challenge_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `challenge_id` INT NOT NULL,
  `question_text` TEXT NOT NULL,
  `option_a` VARCHAR(255) NOT NULL,
  `option_b` VARCHAR(255) NOT NULL,
  `option_c` VARCHAR(255) NOT NULL,
  `option_d` VARCHAR(255) NOT NULL,
  `correct_option` ENUM('A', 'B', 'C', 'D') NOT NULL,
  `explanation` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_cq_challenge` (`challenge_id`),
  CONSTRAINT `fk_cq_challenge` FOREIGN KEY (`challenge_id`) REFERENCES `daily_challenges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 19. Challenge Attempts Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `challenge_attempts`;
CREATE TABLE `challenge_attempts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `challenge_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `selected_option` ENUM('A', 'B', 'C', 'D') NOT NULL,
  `is_correct` BOOLEAN NOT NULL DEFAULT FALSE,
  `points_awarded` INT NOT NULL DEFAULT 0,
  `attempted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_challenge_student` (`challenge_id`, `student_id`),
  INDEX `idx_ca_student` (`student_id`),
  CONSTRAINT `fk_ca_challenge` FOREIGN KEY (`challenge_id`) REFERENCES `daily_challenges` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ca_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 20. Student Streaks Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `student_streaks`;
CREATE TABLE `student_streaks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL UNIQUE,
  `current_streak` INT NOT NULL DEFAULT 0,
  `max_streak` INT NOT NULL DEFAULT 0,
  `last_activity_date` DATE NULL,
  `total_points` INT NOT NULL DEFAULT 0,
  `challenges_completed` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_streak_points` (`total_points` DESC),
  CONSTRAINT `fk_streak_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 21. Vocabulary Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `vocabulary`;
CREATE TABLE `vocabulary` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `word` VARCHAR(100) NOT NULL UNIQUE,
  `pronunciation` VARCHAR(100) NULL,
  `part_of_speech` VARCHAR(50) NOT NULL,
  `definition` TEXT NOT NULL,
  `example_sentence` TEXT NOT NULL,
  `synonyms` VARCHAR(255) NULL,
  `antonyms` VARCHAR(255) NULL,
  `difficulty` ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_vocab_word` (`word`),
  INDEX `idx_vocab_diff` (`difficulty`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 22. Student Vocabulary Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `student_vocabulary`;
CREATE TABLE `student_vocabulary` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `vocab_id` INT NOT NULL,
  `status` ENUM('known', 'practice_again') NOT NULL DEFAULT 'practice_again',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_student_vocab` (`student_id`, `vocab_id`),
  INDEX `idx_sv_student` (`student_id`),
  INDEX `idx_sv_status` (`status`),
  CONSTRAINT `fk_sv_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sv_vocab` FOREIGN KEY (`vocab_id`) REFERENCES `vocabulary` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 23. Videos Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `videos`;
CREATE TABLE `videos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `category` VARCHAR(60) NOT NULL,
  `difficulty` ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  `youtube_url` VARCHAR(255) NOT NULL,
  `duration` VARCHAR(20) NOT NULL DEFAULT '15:00',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_video_cat` (`category`),
  INDEX `idx_video_diff` (`difficulty`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 24. Student Video Progress Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `student_video_progress`;
CREATE TABLE `student_video_progress` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `video_id` INT NOT NULL,
  `is_completed` BOOLEAN NOT NULL DEFAULT FALSE,
  `completed_at` TIMESTAMP NULL,
  UNIQUE KEY `uk_student_video` (`student_id`, `video_id`),
  INDEX `idx_svp_student` (`student_id`),
  CONSTRAINT `fk_svp_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_svp_video` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 25. Resources Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `resources`;
CREATE TABLE `resources` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `category` VARCHAR(60) NOT NULL,
  `file_url` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(20) NOT NULL DEFAULT 'PDF',
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_resource_cat` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 26. Notifications Table
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NULL COMMENT 'NULL represents a global broadcast to all students',
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('new_company', 'deadline_approaching', 'new_test', 'daily_challenge', 'new_interview_experience', 'new_video', 'drive_tomorrow', 'status_change', 'general') NOT NULL DEFAULT 'general',
  `link` VARCHAR(255) NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notif_student` (`student_id`),
  INDEX `idx_notif_read` (`is_read`),
  INDEX `idx_notif_type` (`type`),
  INDEX `idx_notif_created` (`created_at` DESC),
  CONSTRAINT `fk_notif_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

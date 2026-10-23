const cron = require('node-cron');
const pool = require('./db');

/**
 * Initializes cron jobs for automated placement notifications:
 * 1. Daily morning job (08:00 AM) checking placement drives happening tomorrow.
 * 2. Daily morning job (08:00 AM) checking application deadlines expiring in <= 24 hours.
 */
const initCronJobs = () => {
  // Run daily at 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running daily placement notification cron job...');
    try {
      // 1. Notify for drives happening tomorrow
      const [tomorrowDrives] = await pool.query(`
        SELECT pd.id, pd.job_title, c.name AS company_name, pd.drive_date
        FROM placement_drives pd
        JOIN companies c ON pd.company_id = c.id
        WHERE pd.status = 'published'
          AND DATE(pd.drive_date) = DATE(DATE_ADD(CURDATE(), INTERVAL 1 DAY))
      `);

      for (const drive of tomorrowDrives) {
        // Check if notification already exists to avoid duplicate broadcasts
        const [existing] = await pool.query(
          `SELECT id FROM notifications WHERE type = 'drive_tomorrow' AND title LIKE ? AND DATE(created_at) = CURDATE()`,
          [`%${drive.company_name}%`]
        );

        if (existing.length === 0) {
          await pool.query(
            `INSERT INTO notifications (student_id, title, message, type, link)
             VALUES (NULL, ?, ?, 'drive_tomorrow', ?)`,
            [
              `Placement Drive Tomorrow: ${drive.company_name}`,
              `The campus placement drive for "${drive.job_title}" at ${drive.company_name} is scheduled for tomorrow (${new Date(drive.drive_date).toLocaleDateString()}). Be prepared with your resume and college ID.`,
              `/student/companies`
            ]
          );
          console.log(`📢 Generated drive_tomorrow notification for ${drive.company_name}`);
        }
      }

      // 2. Notify for deadlines expiring in the next 24 hours
      const [expiringDrives] = await pool.query(`
        SELECT pd.id, pd.job_title, c.name AS company_name, pd.application_deadline
        FROM placement_drives pd
        JOIN companies c ON pd.company_id = c.id
        WHERE pd.status = 'published'
          AND pd.application_deadline BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
      `);

      for (const drive of expiringDrives) {
        const [existing] = await pool.query(
          `SELECT id FROM notifications WHERE type = 'deadline_approaching' AND title LIKE ? AND DATE(created_at) = CURDATE()`,
          [`%${drive.company_name}%`]
        );

        if (existing.length === 0) {
          await pool.query(
            `INSERT INTO notifications (student_id, title, message, type, link)
             VALUES (NULL, ?, ?, 'deadline_approaching', ?)`,
            [
              `Deadline Approaching Today: ${drive.company_name}`,
              `Application deadline for ${drive.company_name} (${drive.job_title}) is closing soon! Submit your interest before the deadline.`,
              `/student/companies`
            ]
          );
          console.log(`📢 Generated deadline_approaching notification for ${drive.company_name}`);
        }
      }
    } catch (err) {
      console.error('❌ Error executing placement cron job:', err.message);
    }
  });

  console.log('⏰ Placement notification cron scheduler initialized');
};

module.exports = { initCronJobs };

const pool = require('../config/db');

class CodingQuestionModel {
  /**
   * Get all coding questions with optional solved status for a student
   */
  static async findAll({ difficulty, category, search, student_id, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE cq.is_active = TRUE';
    const params = [];

    if (difficulty) {
      whereClause += ' AND cq.difficulty = ?';
      params.push(difficulty);
    }

    if (category) {
      whereClause += ' AND cq.category = ?';
      params.push(category);
    }

    if (search) {
      whereClause += ' AND (cq.title LIKE ? OR cq.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Total Count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM coding_questions cq ${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    // Submissions join to check if student has solved it
    const studentSelect = student_id
      ? `, (SELECT COUNT(*) FROM coding_submissions cs WHERE cs.question_id = cq.id AND cs.student_id = ? AND cs.status = 'Accepted') > 0 AS is_solved`
      : `, FALSE AS is_solved`;

    const queryParams = student_id
      ? [student_id, ...params, parseInt(limit, 10), parseInt(offset, 10)]
      : [...params, parseInt(limit, 10), parseInt(offset, 10)];

    const [rows] = await pool.query(
      `SELECT
        cq.id, cq.title, cq.difficulty, cq.category,
        SUBSTRING(cq.description, 1, 150) AS description_snippet,
        cq.points, cq.time_limit, cq.created_at
        ${studentSelect}
       FROM coding_questions cq
       ${whereClause}
       ORDER BY cq.id ASC
       LIMIT ? OFFSET ?`,
      queryParams
    );

    return {
      items: rows.map((r) => ({ ...r, is_solved: Boolean(r.is_solved) })),
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single coding question by ID
   */
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT * FROM coding_questions WHERE id = ? AND is_active = TRUE LIMIT 1`,
      [id]
    );

    if (!rows[0]) return null;

    const question = rows[0];
    let parsedTestCases = [];
    if (question.test_cases) {
      try {
        parsedTestCases = typeof question.test_cases === 'string'
          ? JSON.parse(question.test_cases)
          : question.test_cases;
      } catch (e) {
        parsedTestCases = [];
      }
    }

    return {
      ...question,
      test_cases: parsedTestCases,
    };
  }

  /**
   * Get distinct categories
   */
  static async getCategories() {
    const [rows] = await pool.query(
      `SELECT DISTINCT category FROM coding_questions WHERE is_active = TRUE ORDER BY category ASC`
    );
    return rows.map((r) => r.category);
  }

  /**
   * Admin: Create coding question
   */
  static async create({
    title,
    difficulty,
    category,
    description,
    input_format,
    output_format,
    constraints,
    sample_input,
    sample_output,
    explanation,
    test_cases,
    starter_c,
    starter_java,
    time_limit,
    points,
  }) {
    const formattedTestCases = typeof test_cases === 'string'
      ? test_cases
      : JSON.stringify(test_cases || []);

    const defaultStarterC = `#include <stdio.h>\n\nint main() {\n    // Read input from standard input\n    \n    // Write your code here\n    \n    return 0;\n}`;
    const defaultStarterJava = `import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your code here\n        \n    }\n}`;

    const [result] = await pool.query(
      `INSERT INTO coding_questions (
        title, difficulty, category, description,
        input_format, output_format, constraints,
        sample_input, sample_output, explanation,
        test_cases, starter_c, starter_java,
        time_limit, points
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        difficulty || 'medium',
        category || 'Algorithms',
        description,
        input_format || null,
        output_format || null,
        constraints || null,
        sample_input || null,
        sample_output || null,
        explanation || null,
        formattedTestCases,
        starter_c || defaultStarterC,
        starter_java || defaultStarterJava,
        time_limit || 2000,
        points || 50,
      ]
    );

    return result.insertId;
  }

  /**
   * Admin: Update coding question
   */
  static async update(id, {
    title,
    difficulty,
    category,
    description,
    input_format,
    output_format,
    constraints,
    sample_input,
    sample_output,
    explanation,
    test_cases,
    starter_c,
    starter_java,
    time_limit,
    points,
  }) {
    const formattedTestCases = typeof test_cases === 'string'
      ? test_cases
      : JSON.stringify(test_cases || []);

    const [result] = await pool.query(
      `UPDATE coding_questions SET
        title = ?, difficulty = ?, category = ?, description = ?,
        input_format = ?, output_format = ?, constraints = ?,
        sample_input = ?, sample_output = ?, explanation = ?,
        test_cases = ?, starter_c = ?, starter_java = ?,
        time_limit = ?, points = ?
       WHERE id = ?`,
      [
        title,
        difficulty,
        category,
        description,
        input_format || null,
        output_format || null,
        constraints || null,
        sample_input || null,
        sample_output || null,
        explanation || null,
        formattedTestCases,
        starter_c,
        starter_java,
        time_limit || 2000,
        points || 50,
        id,
      ]
    );

    return result.affectedRows > 0;
  }

  /**
   * Admin: Delete coding question
   */
  static async delete(id) {
    const [result] = await pool.query(`DELETE FROM coding_questions WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Save submission record
   */
  static async saveSubmission({
    question_id,
    student_id,
    language,
    source_code,
    status,
    passed_test_cases,
    total_test_cases,
    execution_time_ms,
    error_message,
  }) {
    const [result] = await pool.query(
      `INSERT INTO coding_submissions (
        question_id, student_id, language, source_code, status,
        passed_test_cases, total_test_cases, execution_time_ms, error_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        question_id,
        student_id,
        language,
        source_code,
        status,
        passed_test_cases,
        total_test_cases,
        execution_time_ms,
        error_message || null,
      ]
    );

    return result.insertId;
  }

  /**
   * Get student's submission history for a question
   */
  static async getSubmissions(question_id, student_id) {
    const [rows] = await pool.query(
      `SELECT id, language, status, passed_test_cases, total_test_cases, execution_time_ms, error_message, created_at
       FROM coding_submissions
       WHERE question_id = ? AND student_id = ?
       ORDER BY created_at DESC
       LIMIT 15`,
      [question_id, student_id]
    );
    return rows;
  }

  /**
   * Admin: Get all submissions across all students
   */
  static async getAllSubmissions({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;

    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM coding_submissions`);
    const total = countResult[0]?.total || 0;

    const [rows] = await pool.query(
      `SELECT
        cs.*,
        cq.title AS question_title,
        s.full_name AS student_name,
        s.register_number,
        s.department
       FROM coding_submissions cs
       JOIN coding_questions cq ON cs.question_id = cq.id
       JOIN students s ON cs.student_id = s.id
       ORDER BY cs.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit, 10), parseInt(offset, 10)]
    );

    return {
      items: rows,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
    };
  }
}

module.exports = CodingQuestionModel;

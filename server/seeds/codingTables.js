const pool = require('../config/db');

async function createCodingTables() {
  const createQuestionsSql = `
    CREATE TABLE IF NOT EXISTS coding_questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
      category VARCHAR(100) DEFAULT 'Algorithms',
      description TEXT NOT NULL,
      input_format TEXT,
      output_format TEXT,
      constraints TEXT,
      sample_input TEXT,
      sample_output TEXT,
      explanation TEXT,
      test_cases JSON,
      starter_c TEXT,
      starter_java TEXT,
      time_limit INT DEFAULT 2000,
      points INT DEFAULT 50,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

  const createSubmissionsSql = `
    CREATE TABLE IF NOT EXISTS coding_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question_id INT NOT NULL,
      student_id INT NOT NULL,
      language ENUM('c', 'java') NOT NULL,
      source_code MEDIUMTEXT NOT NULL,
      status ENUM('Accepted', 'Wrong Answer', 'Compile Error', 'Runtime Error', 'Time Limit Exceeded') NOT NULL,
      passed_test_cases INT DEFAULT 0,
      total_test_cases INT DEFAULT 0,
      execution_time_ms INT DEFAULT 0,
      error_message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_id) REFERENCES coding_questions(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `;

  await pool.query(createQuestionsSql);
  await pool.query(createSubmissionsSql);
  console.log('✅ Tables coding_questions and coding_submissions created successfully');

  // Check if coding questions already exist
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM coding_questions');
  if (rows[0].count === 0) {
    console.log('Seeding initial campus coding questions...');
    const seedQuestions = [
      {
        title: 'Two Sum Problem',
        difficulty: 'easy',
        category: 'Arrays & Hashing',
        description: 'Given an array of integers `nums` and an integer `target`, return the two numbers that add up to `target` separated by a space.\nAssume exactly one solution exists.',
        input_format: 'First line contains integer N (size of array).\nSecond line contains N space-separated integers.\nThird line contains integer target.',
        output_format: 'Print the two numbers separated by a space in non-decreasing order.',
        constraints: '2 <= N <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
        sample_input: '4\n2 7 11 15\n9',
        sample_output: '2 7',
        explanation: 'Because 2 + 7 == 9, we output 2 7.',
        test_cases: JSON.stringify([
          { input: '4\n2 7 11 15\n9', expected_output: '2 7', is_hidden: false },
          { input: '3\n3 2 4\n6', expected_output: '2 4', is_hidden: false },
          { input: '2\n3 3\n6', expected_output: '3 3', is_hidden: true },
          { input: '5\n1 5 3 8 2\n10', expected_output: '2 8', is_hidden: true }
        ]),
        starter_c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int a[n];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int target;
    scanf("%d", &target);

    // Write your solution below
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (a[i] + a[j] == target) {
                if (a[i] <= a[j]) printf("%d %d\\n", a[i], a[j]);
                else printf("%d %d\\n", a[j], a[i]);
                return 0;
            }
        }
    }
    return 0;
}`,
        starter_java: `import java.util.Scanner;
import java.util.Arrays;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        int target = sc.nextInt();

        // Write your solution below
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (a[i] + a[j] == target) {
                    if (a[i] <= a[j]) {
                        System.out.println(a[i] + " " + a[j]);
                    } else {
                        System.out.println(a[j] + " " + a[i]);
                    }
                    return;
                }
            }
        }
    }
}`,
        time_limit: 2000,
        points: 50,
      },
      {
        title: 'Reverse Words in a String',
        difficulty: 'medium',
        category: 'Strings',
        description: 'Given a sentence string, reverse the order of the words.',
        input_format: 'A single line containing words separated by single spaces.',
        output_format: 'The words in reverse order separated by single spaces.',
        constraints: '1 <= Length of string <= 1000\nWords consist of alphanumeric characters.',
        sample_input: 'the sky is blue',
        sample_output: 'blue is sky the',
        explanation: 'The reversed order of words is "blue is sky the".',
        test_cases: JSON.stringify([
          { input: 'the sky is blue', expected_output: 'blue is sky the', is_hidden: false },
          { input: 'hello world', expected_output: 'world hello', is_hidden: false },
          { input: 'campus placement ready', expected_output: 'ready placement campus', is_hidden: true },
          { input: 'prepare apply get placed', expected_output: 'placed get apply prepare', is_hidden: true }
        ]),
        starter_c: `#include <stdio.h>
#include <string.h>

int main() {
    char str[1005];
    if (!fgets(str, sizeof(str), stdin)) return 0;
    
    // Remove trailing newline if present
    int len = strlen(str);
    if (len > 0 && str[len - 1] == '\\n') str[len - 1] = '\\0';

    // Tokenize words
    char words[100][100];
    int count = 0;
    char *token = strtok(str, " ");
    while (token != NULL) {
        strcpy(words[count++], token);
        token = strtok(NULL, " ");
    }

    // Print in reverse
    for (int i = count - 1; i >= 0; i--) {
        printf("%s%c", words[i], (i == 0 ? '\\n' : ' '));
    }
    return 0;
}`,
        starter_java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().trim();
        String[] words = line.split("\\\\s+");

        StringBuilder sb = new StringBuilder();
        for (int i = words.length - 1; i >= 0; i--) {
            sb.append(words[i]);
            if (i > 0) sb.append(" ");
        }
        System.out.println(sb.toString());
    }
}`,
        time_limit: 2000,
        points: 75,
      },
      {
        title: 'Valid Parentheses Checker',
        difficulty: 'easy',
        category: 'Stack',
        description: 'Given a string containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\nAn input string is valid if brackets close in the correct order.',
        input_format: 'A single string consisting of bracket characters.',
        output_format: 'Print `true` if valid, otherwise print `false`.',
        constraints: '1 <= string length <= 10^4',
        sample_input: '()[]{}',
        sample_output: 'true',
        explanation: 'Every opening bracket has a corresponding closing bracket in the right order.',
        test_cases: JSON.stringify([
          { input: '()[]{}', expected_output: 'true', is_hidden: false },
          { input: '(]', expected_output: 'false', is_hidden: false },
          { input: '([{}])', expected_output: 'true', is_hidden: true },
          { input: '((()', expected_output: 'false', is_hidden: true }
        ]),
        starter_c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>

int main() {
    char s[10005];
    if (scanf("%s", s) != 1) return 0;

    char stack[10005];
    int top = -1;
    bool valid = true;

    for (int i = 0; s[i] != '\\0'; i++) {
        char c = s[i];
        if (c == '(' || c == '{' || c == '[') {
            stack[++top] = c;
        } else {
            if (top == -1) { valid = false; break; }
            char open = stack[top--];
            if ((c == ')' && open != '(') ||
                (c == '}' && open != '{') ||
                (c == ']' && open != '[')) {
                valid = false;
                break;
            }
        }
    }
    if (top != -1) valid = false;

    printf("%s\\n", valid ? "true" : "false");
    return 0;
}`,
        starter_java: `import java.util.Scanner;
import java.util.Stack;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String s = sc.next();

        Stack<Character> stack = new Stack<>();
        boolean valid = true;

        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) { valid = false; break; }
                char open = stack.pop();
                if ((c == ')' && open != '(') ||
                    (c == '}' && open != '{') ||
                    (c == ']' && open != '[')) {
                    valid = false;
                    break;
                }
            }
        }
        if (!stack.isEmpty()) valid = false;

        System.out.println(valid ? "true" : "false");
    }
}`,
        time_limit: 2000,
        points: 50,
      }
    ];

    for (const q of seedQuestions) {
      await pool.query(
        `INSERT INTO coding_questions (title, difficulty, category, description, input_format, output_format, constraints, sample_input, sample_output, explanation, test_cases, starter_c, starter_java, time_limit, points)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [q.title, q.difficulty, q.category, q.description, q.input_format, q.output_format, q.constraints, q.sample_input, q.sample_output, q.explanation, q.test_cases, q.starter_c, q.starter_java, q.time_limit, q.points]
      );
    }
    console.log('✅ Seeded 3 benchmark coding questions for C & Java practice');
  }

  process.exit(0);
}

createCodingTables().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});

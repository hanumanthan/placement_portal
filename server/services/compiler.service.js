const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const crypto = require('crypto');

class CompilerService {
  /**
   * Execute C code via local gcc (if available) or Wandbox API
   */
  static async executeC(code, stdin = '', timeout = 4000) {
    const startTime = Date.now();

    // Check Wandbox API execution
    try {
      const payload = JSON.stringify({
        compiler: 'gcc-head',
        code: code,
        stdin: stdin || ''
      });

      const result = await new Promise((resolve, reject) => {
        const req = https.request('https://wandbox.org/api/compile.json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          },
          timeout: timeout + 3000
        }, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch (err) {
              reject(err);
            }
          });
        });

        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Compilation Timed Out'));
        });
        req.write(payload);
        req.end();
      });

      const executionTime = Date.now() - startTime;

      if (result.compiler_error || (result.status !== '0' && !result.program_output && result.compiler_message)) {
        return {
          success: false,
          status: 'Compile Error',
          output: '',
          error: result.compiler_error || result.compiler_message || 'Compilation failed',
          executionTime
        };
      }

      if (result.status !== '0' && result.program_error) {
        return {
          success: false,
          status: 'Runtime Error',
          output: result.program_output || '',
          error: result.program_error,
          executionTime
        };
      }

      return {
        success: true,
        status: 'Success',
        output: result.program_output || '',
        error: result.program_error || '',
        executionTime
      };
    } catch (wandboxErr) {
      // Wandbox fallback or network issue
      return {
        success: false,
        status: 'Runtime Error',
        output: '',
        error: 'Execution failed: ' + (wandboxErr.message || 'Unknown network error'),
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Execute Java code using local javac and java
   */
  static async executeJava(code, stdin = '', timeout = 4000) {
    const startTime = Date.now();
    const runId = crypto.randomBytes(6).toString('hex');
    const tmpDir = path.join(os.tmpdir(), `java_exec_${runId}`);

    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      // Ensure class name matches file name
      let className = 'Solution';
      const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
      if (classMatch && classMatch[1]) {
        className = classMatch[1];
      }

      const javaFilePath = path.join(tmpDir, `${className}.java`);
      fs.writeFileSync(javaFilePath, code, 'utf8');

      // 1. Compile with javac
      const compileErr = await new Promise((resolve) => {
        exec(`javac -encoding UTF-8 "${className}.java"`, { cwd: tmpDir, timeout: 5000 }, (error, stdout, stderr) => {
          if (error || stderr) {
            resolve(stderr || error.message);
          } else {
            resolve(null);
          }
        });
      });

      if (compileErr) {
        return {
          success: false,
          status: 'Compile Error',
          output: '',
          error: compileErr,
          executionTime: Date.now() - startTime
        };
      }

      // 2. Execute with java
      const runResult = await new Promise((resolve) => {
        const proc = spawn('java', ['-Xmx256m', className], {
          cwd: tmpDir,
          timeout: timeout
        });

        let stdout = '';
        let stderr = '';
        let isTimeout = false;

        const timer = setTimeout(() => {
          isTimeout = true;
          proc.kill();
        }, timeout);

        if (stdin) {
          proc.stdin.write(stdin);
          proc.stdin.end();
        } else {
          proc.stdin.end();
        }

        proc.stdout.on('data', (data) => { stdout += data.toString(); });
        proc.stderr.on('data', (data) => { stderr += data.toString(); });

        proc.on('close', (code) => {
          clearTimeout(timer);
          if (isTimeout) {
            resolve({ success: false, status: 'Time Limit Exceeded', output: stdout, error: 'Execution timed out.' });
          } else if (code !== 0 && stderr) {
            resolve({ success: false, status: 'Runtime Error', output: stdout, error: stderr });
          } else {
            resolve({ success: true, status: 'Success', output: stdout, error: stderr });
          }
        });

        proc.on('error', (err) => {
          clearTimeout(timer);
          resolve({ success: false, status: 'Runtime Error', output: '', error: err.message });
        });
      });

      return {
        ...runResult,
        executionTime: Date.now() - startTime
      };
    } finally {
      // Cleanup files asynchronously with delay to release Windows file lock
      setTimeout(() => {
        try {
          if (fs.existsSync(tmpDir)) {
            fs.rmSync(tmpDir, { recursive: true, force: true });
          }
        } catch (_) {}
      }, 500);
    }
  }

  /**
   * Dispatch execution based on language ('c' or 'java')
   */
  static async execute(language, code, stdin = '', timeout = 4000) {
    const lang = (language || '').toLowerCase().trim();
    if (lang === 'c') {
      return this.executeC(code, stdin, timeout);
    } else if (lang === 'java') {
      return this.executeJava(code, stdin, timeout);
    } else {
      throw new Error('Unsupported language. Only "c" and "java" are supported.');
    }
  }

  /**
   * Run full test suite evaluation against all test cases
   */
  static async evaluateTestCases(language, code, testCases = [], timeLimit = 3000) {
    let passedCount = 0;
    const totalCount = testCases.length;
    const testResults = [];
    let overallStatus = 'Accepted';
    let totalExecTime = 0;
    let fatalError = null;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const result = await this.execute(language, code, tc.input || '', timeLimit);
      totalExecTime += result.executionTime || 0;

      if (result.status === 'Compile Error') {
        return {
          status: 'Compile Error',
          passedCount: 0,
          totalCount,
          executionTime: totalExecTime,
          errorMessage: result.error,
          testResults: []
        };
      }

      const actualOutput = (result.output || '').trim().replace(/\r\n/g, '\n');
      const expectedOutput = (tc.expected_output || '').trim().replace(/\r\n/g, '\n');

      const isMatch = actualOutput === expectedOutput && result.success;

      if (isMatch) {
        passedCount++;
      } else {
        if (overallStatus === 'Accepted') {
          if (result.status === 'Time Limit Exceeded') overallStatus = 'Time Limit Exceeded';
          else if (result.status === 'Runtime Error') overallStatus = 'Runtime Error';
          else overallStatus = 'Wrong Answer';
          fatalError = result.error || null;
        }
      }

      testResults.push({
        testCaseIndex: i + 1,
        isHidden: Boolean(tc.is_hidden),
        input: tc.is_hidden ? 'Hidden Test Case' : tc.input,
        expectedOutput: tc.is_hidden ? 'Hidden' : expectedOutput,
        actualOutput: tc.is_hidden ? (isMatch ? 'Passed' : 'Wrong Output') : actualOutput,
        passed: isMatch,
        executionTime: result.executionTime,
        error: tc.is_hidden ? null : result.error
      });
    }

    return {
      status: overallStatus,
      passedCount,
      totalCount,
      executionTime: totalExecTime,
      errorMessage: fatalError,
      testResults
    };
  }
}

module.exports = CompilerService;

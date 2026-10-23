const bcrypt = require('bcryptjs');
const AuthModel = require('../models/auth.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { signToken, setAuthCookie, clearAuthCookie } = require('../utils/jwt');
const { sendSuccess, sendCreated } = require('../utils/response');

/**
 * @desc    Register a new student
 * @route   POST /api/auth/student/register
 * @access  Public
 */
const studentRegister = catchAsync(async (req, res, next) => {
  const {
    full_name,
    register_number,
    email,
    phone,
    password,
    department,
    course,
    batch,
    graduation_year,
  } = req.body;

  // 1. Check if email or register number already exists
  const existingEmail = await AuthModel.findStudentByIdentifier(email);
  if (existingEmail) {
    return next(new AppError('A student account with this email already exists.', 409));
  }

  const existingRegNo = await AuthModel.findStudentByIdentifier(register_number);
  if (existingRegNo) {
    return next(new AppError('A student account with this register number already exists.', 409));
  }

  // 2. Hash password with bcrypt (cost 10)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Create student, profile, and streak
  const studentId = await AuthModel.createStudent({
    full_name,
    register_number,
    email,
    phone,
    password: hashedPassword,
    department,
    course: course || 'B.Tech',
    batch: batch || '2021-2025',
    graduation_year: graduation_year || 2025,
  });

  // 4. Retrieve newly created student record
  const student = await AuthModel.findStudentById(studentId);

  // 5. Generate token & set cookie
  const token = signToken({ id: student.id, role: 'student', email: student.email });
  setAuthCookie(res, token);

  // 6. Return response
  sendCreated(res, {
    user: student,
    role: 'student',
    token,
  }, 'Student registration successful');
});

/**
 * @desc    Login student with Email OR Register Number
 * @route   POST /api/auth/student/login
 * @access  Public
 */
const studentLogin = catchAsync(async (req, res, next) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return next(new AppError('Please provide email/register number and password.', 400));
  }

  // 1. Lookup student by email or register number
  const student = await AuthModel.findStudentByIdentifier(identifier.trim());

  // 2. Check if student exists and verify password (using constant-time-like generic message)
  if (!student) {
    return next(new AppError('Invalid email/register number or password.', 401));
  }

  // 3. Check if account is active
  if (!student.is_active) {
    return next(new AppError('Your account has been deactivated. Please contact the placement administrator.', 403));
  }

  const isPasswordMatch = await bcrypt.compare(password, student.password);
  if (!isPasswordMatch) {
    return next(new AppError('Invalid email/register number or password.', 401));
  }

  // 4. Fetch full student profile
  const fullProfile = await AuthModel.findStudentById(student.id);

  // 5. Sign token and set cookie
  const token = signToken({ id: student.id, role: 'student', email: student.email });
  setAuthCookie(res, token);

  sendSuccess(res, {
    user: fullProfile,
    role: 'student',
    token,
  }, 'Login successful');
});

/**
 * @desc    Admin login
 * @route   POST /api/auth/admin/login
 * @access  Public
 */
const adminLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  // 1. Lookup admin by email
  const admin = await AuthModel.findAdminByEmail(email.trim());

  if (!admin) {
    return next(new AppError('Invalid email or password.', 401));
  }

  // 2. Check password match
  const isPasswordMatch = await bcrypt.compare(password, admin.password);
  if (!isPasswordMatch) {
    return next(new AppError('Invalid email or password.', 401));
  }

  // 3. Sign token and set cookie
  const token = signToken({ id: admin.id, role: 'admin', email: admin.email });
  setAuthCookie(res, token);

  const adminData = {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: 'admin',
    created_at: admin.created_at,
  };

  sendSuccess(res, {
    user: adminData,
    role: 'admin',
    token,
  }, 'Admin login successful');
});

/**
 * @desc    Logout user / clear auth cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = catchAsync(async (req, res) => {
  clearAuthCookie(res);
  sendSuccess(res, null, 'Logged out successfully');
});

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private (Student or Admin)
 */
const getMe = catchAsync(async (req, res) => {
  sendSuccess(res, {
    user: req.user,
    role: req.userRole,
  }, 'Profile retrieved successfully');
});

module.exports = {
  studentRegister,
  studentLogin,
  adminLogin,
  logout,
  getMe,
};

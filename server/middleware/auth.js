const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const AuthModel = require('../models/auth.model');

/**
 * Protect middleware: Ensures request has a valid JWT session
 */
const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Extract token from httpOnly cookie or Authorization header
  if (req.cookies && req.cookies.token && req.cookies.token !== 'loggedout') {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
  }

  // 2. Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key_change_in_production_abc123xyz');
  } catch (err) {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }

  // 3. Check if user still exists and is active
  let currentUser;
  if (decoded.role === 'admin') {
    currentUser = await AuthModel.findAdminById(decoded.id);
  } else {
    currentUser = await AuthModel.findStudentById(decoded.id);
    if (currentUser && !currentUser.is_active) {
      return next(new AppError('Your account has been deactivated. Please contact the placement administrator.', 403));
    }
  }

  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // 4. Attach user and role to request object
  req.user = currentUser;
  req.userRole = decoded.role;
  if (!req.user.role) {
    req.user.role = decoded.role;
  }
  next();
});

/**
 * Restrict access to specific roles (e.g. 'admin' or 'student')
 * @param  {...String} roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
  authenticateToken: protect,
  requireRole: restrictTo,
};

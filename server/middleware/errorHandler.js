const AppError = require('../utils/AppError');

/**
 * Central Error Handler Middleware
 * Normalizes validation, JWT, Multer, MySQL errors and prevents sensitive stack leaks in production.
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new AppError('File size exceeds the allowed limit.', 400);
    } else {
      error = new AppError(`Upload error: ${err.message}`, 400);
    }
  }

  // Handle MySQL Duplicate Entry (ER_DUP_ENTRY)
  if (err.code === 'ER_DUP_ENTRY') {
    const valueMatch = err.sqlMessage ? err.sqlMessage.match(/for key '(.+?)'/) : null;
    const field = valueMatch ? valueMatch[1] : 'Field';
    error = new AppError(`Duplicate entry detected. A record with this value already exists (${field}).`, 409);
  }

  // Handle MySQL Foreign Key Failure
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error = new AppError('Referenced resource not found.', 400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid authentication token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your session has expired. Please log in again.', 401);
  }

  // Log non-operational errors for debugging
  if (!error.isOperational) {
    console.error('💥 UNEXPECTED SYSTEM ERROR:', err);
  }

  const isDev = process.env.NODE_ENV === 'development';

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error occurred. Please try again later.',
    ...(isDev && { stack: err.stack, code: err.code }),
  });
};

module.exports = errorHandler;

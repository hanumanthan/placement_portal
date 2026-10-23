/**
 * Standard API response helpers for consistent JSON format.
 * All responses follow: { success, message, data?, pagination? }
 */

const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendCreated = (res, data, message = 'Created successfully') => {
  res.status(201).json({
    success: true,
    message,
    data,
  });
};

const sendPaginated = (res, data, pagination, message = 'Success') => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

const sendError = (res, message = 'Something went wrong', statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendError,
  successResponse: (res, data, message = 'Success', statusCode = 200) =>
    sendSuccess(res, data, message, statusCode),
  errorResponse: (res, message = 'Something went wrong', statusCode = 500) =>
    sendError(res, message, statusCode),
};

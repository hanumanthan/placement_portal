const jwt = require('jsonwebtoken');

/**
 * Sign JWT Token
 * @param {Object} payload - { id, role, email, name, ... }
 * @returns {String} token
 */
const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret_key_change_in_production_abc123xyz', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Set HTTP-Only, SameSite cookie with the JWT token
 * @param {Object} res - Express response
 * @param {String} token - JWT token string
 */
const setAuthCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);
};

/**
 * Clear the auth cookie on logout
 * @param {Object} res - Express response
 */
const clearAuthCookie = (res) => {
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 5000),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
};

module.exports = {
  signToken,
  setAuthCookie,
  clearAuthCookie,
};

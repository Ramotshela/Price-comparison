const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiResponse = require('../utils/ApiResponse');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return ApiResponse.error(res, { message: 'Authentication required', statusCode: 401 });
  }

  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, config.jwt.secret);
    next();
  } catch {
    return ApiResponse.error(res, { message: 'Invalid or expired token', statusCode: 401 });
  }
}

module.exports = authenticate;

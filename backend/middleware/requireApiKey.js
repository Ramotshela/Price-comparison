const config = require('../config');
const ApiResponse = require('../utils/ApiResponse');

function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key || key !== config.scraperApiKey) {
    return ApiResponse.error(res, { message: 'Forbidden', statusCode: 403 });
  }
  next();
}

module.exports = requireApiKey;

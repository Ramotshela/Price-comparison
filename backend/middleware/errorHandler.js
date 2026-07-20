const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');

function errorHandler(err, req, res, _next) {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) logger.error({ err }, err.message);
  const statusCode = err.status || 500;
  const message = isProd && statusCode === 500 ? 'Internal Server Error' : err.message || 'Internal Server Error';
  ApiResponse.error(res, { message, statusCode });
}

module.exports = errorHandler;

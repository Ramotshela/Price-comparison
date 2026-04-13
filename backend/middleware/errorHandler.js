const ApiResponse = require('../utils/ApiResponse');

function errorHandler(err, req, res, _next) {
  console.error(err.stack || err.message);
  const statusCode = err.status || 500;
  ApiResponse.error(res, { message: err.message || 'Internal Server Error', statusCode });
}

module.exports = errorHandler;

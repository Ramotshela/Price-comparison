const express = require('express');
const router = express.Router();
const authServiceFactory = require('../services/authService');
const { validate, registerSchema, loginSchema } = require('../middleware/validate');
const ApiResponse = require('../utils/ApiResponse');

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

module.exports = (pool) => {
  const auth = authServiceFactory(pool);

  router.post('/auth/register', validate(registerSchema), asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    try {
      const user = await auth.register(name, email, password);
      const loginResult = await auth.login(email, password);
      ApiResponse.success(res, {
        statusCode: 201,
        message: 'Account created',
        data: loginResult,
      });
    } catch (err) {
      if (err.code === '23505') {
        return ApiResponse.error(res, { message: 'Email already registered', statusCode: 409 });
      }
      throw err;
    }
  }));

  router.post('/auth/login', validate(loginSchema), asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await auth.login(email, password);

    if (!result) {
      return ApiResponse.error(res, { message: 'Invalid email or password', statusCode: 401 });
    }

    ApiResponse.success(res, { data: result });
  }));

  router.get('/auth/me', require('../middleware/auth'), asyncHandler(async (req, res) => {
    const user = await auth.findById(req.user.id);
    if (!user) {
      return ApiResponse.error(res, { message: 'User not found', statusCode: 404 });
    }
    ApiResponse.success(res, { data: user });
  }));

  return router;
};

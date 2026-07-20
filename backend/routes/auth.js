const express = require('express');
const router = express.Router();
const authServiceFactory = require('../services/authService');
const authenticate = require('../middleware/auth');
const { validate, registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } = require('../middleware/validate');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

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

  router.post('/auth/refresh', asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return ApiResponse.error(res, { message: 'Refresh token required', statusCode: 400 });
    }
    const result = await auth.refresh(refreshToken);
    if (!result) {
      return ApiResponse.error(res, { message: 'Invalid or expired refresh token', statusCode: 401 });
    }
    ApiResponse.success(res, { data: result });
  }));

  router.post('/auth/logout', asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) await auth.logout(refreshToken);
    ApiResponse.success(res, { message: 'Logged out' });
  }));

  router.get('/auth/me', authenticate, asyncHandler(async (req, res) => {
    const user = await auth.findById(req.user.id);
    if (!user) return ApiResponse.error(res, { message: 'User not found', statusCode: 404 });
    ApiResponse.success(res, { data: user });
  }));

  router.patch('/auth/profile', authenticate, validate(updateProfileSchema), asyncHandler(async (req, res) => {
    const user = await auth.updateProfile(req.user.id, req.body);
    if (!user) return ApiResponse.error(res, { message: 'User not found', statusCode: 404 });
    ApiResponse.success(res, { data: user });
  }));

  router.patch('/auth/password', authenticate, validate(changePasswordSchema), asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const changed = await auth.changePassword(req.user.id, currentPassword, newPassword);
    if (!changed) return ApiResponse.error(res, { message: 'Current password is incorrect', statusCode: 400 });
    ApiResponse.success(res, { message: 'Password updated' });
  }));

  return router;
};

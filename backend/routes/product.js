const express = require('express');
const router = express.Router();
const productService = require('../services/productService');
const { sendPriceMatchEmail } = require('../services/emailService');
const { validate, insertProductsSchema, verifyTotalSchema } = require('../middleware/validate');
const ApiResponse = require('../utils/ApiResponse');

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

module.exports = (database) => {
  const products = productService(database);

  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Health check
   *     responses:
   *       200:
   *         description: Service is healthy
   */
  router.get('/health', (_req, res) => {
    ApiResponse.success(res, { message: 'Service is healthy' });
  });

  /**
   * @swagger
   * /insert-products:
   *   post:
   *     summary: Insert products into the database
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               type: object
   *               properties:
   *                 Product Name:
   *                   type: string
   *                 Price:
   *                   type: string
   *                 Category:
   *                   type: string
   *                 Image URL:
   *                   type: string
   *                 Shop Name:
   *                   type: string
   *     responses:
   *       201:
   *         description: Products inserted successfully
   *       400:
   *         description: Validation error
   *       500:
   *         description: Server error
   */
  router.post('/insert-products', validate(insertProductsSchema), asyncHandler(async (req, res) => {
    const result = await products.insertMany(req.body);
    ApiResponse.success(res, {
      statusCode: 201,
      message: `Inserted ${result.insertedCount} products`,
      data: { insertedCount: result.insertedCount },
    });
  }));

  /**
   * @swagger
   * /products/vegetables:
   *   get:
   *     summary: Fetch all vegetable products
   *     responses:
   *       200:
   *         description: List of vegetables
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   _id:
   *                     type: string
   *                   Product Name:
   *                     type: string
   *                   Price:
   *                     type: string
   *                   Category:
   *                     type: string
   *       500:
   *         description: Server error
   */
  router.get('/products/vegetables', asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const result = await products.getVegetables(page, limit);
    ApiResponse.success(res, { data: result });
  }));

  /**
   * @swagger
   * /verify-total:
   *   post:
   *     summary: Verify total price and notify user via email if matched
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - productIds
   *               - userTotalPrice
   *               - userEmail
   *             properties:
   *               productIds:
   *                 type: array
   *                 items:
   *                   type: string
   *               userTotalPrice:
   *                 type: number
   *               userEmail:
   *                 type: string
   *     responses:
   *       200:
   *         description: Verification result
   *       400:
   *         description: Validation error
   *       404:
   *         description: No products found
   *       500:
   *         description: Server error
   */
  router.post('/verify-total', validate(verifyTotalSchema), asyncHandler(async (req, res) => {
    const { productIds, userTotalPrice, userEmail } = req.body;
    const matched = await products.getByIds(productIds);

    if (matched.length === 0) {
      return ApiResponse.error(res, { message: 'No products found for the given IDs', statusCode: 404 });
    }

    const totalPrice = matched.reduce((sum, p) => sum + (p.price || 0), 0);

    if (totalPrice === userTotalPrice) {
      await sendPriceMatchEmail(userEmail, userTotalPrice);
      return ApiResponse.success(res, {
        message: 'Total price matches and email sent',
        data: { products: matched, totalPrice },
      });
    }

    ApiResponse.success(res, {
      message: 'Total price does not match',
      data: { products: matched, totalPrice },
    });
  }));

  return router;
};

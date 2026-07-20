const express = require('express');
const router = express.Router();
const productService = require('../services/productService');
const { sendPriceMatchEmail } = require('../services/emailService');
const { validate, insertProductsSchema, syncProductsSchema, verifyTotalSchema } = require('../middleware/validate');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const requireApiKey = require('../middleware/requireApiKey');
const { checkMongoHealth } = require('../database/mongoClient');
const { checkPgHealth } = require('../database/pgClient');

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
  router.get('/health', asyncHandler(async (_req, res) => {
    const [mongo, pg] = await Promise.allSettled([
      checkMongoHealth(),
      checkPgHealth(),
    ]);
    const status = {
      mongo: mongo.status === 'fulfilled' ? 'ok' : 'error',
      pg: pg.status === 'fulfilled' ? 'ok' : 'error',
    };
    const healthy = Object.values(status).every((s) => s === 'ok');
    ApiResponse.success(res, {
      statusCode: healthy ? 200 : 503,
      message: healthy ? 'Service is healthy' : 'Service is degraded',
      data: status,
    });
  }));

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
  router.post('/sync-products', requireApiKey, validate(syncProductsSchema), asyncHandler(async (req, res) => {
    const { shopName, products: productList } = req.body;
    const result = await products.syncProducts(shopName, productList);
    ApiResponse.success(res, {
      statusCode: 200,
      message: `Synced ${shopName}: ${result.upsertedCount} new, ${result.modifiedCount} updated, ${result.deletedCount} removed`,
      data: result,
    });
  }));

  router.post('/insert-products', requireApiKey, validate(insertProductsSchema), asyncHandler(async (req, res) => {
    const { upsertedCount, modifiedCount } = await products.upsertMany(req.body);
    ApiResponse.success(res, {
      statusCode: 201,
      message: `Upserted ${upsertedCount} new, updated ${modifiedCount} existing products`,
      data: { upsertedCount, modifiedCount },
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
  router.get('/products', asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const { category, shop, search } = req.query;
    const result = await products.getProducts({ page, limit, category, shop, search });
    ApiResponse.success(res, { data: result });
  }));

  router.get('/products/filters', asyncHandler(async (_req, res) => {
    const [categories, shops] = await Promise.all([
      products.getCategories(),
      products.getShops(),
    ]);
    ApiResponse.success(res, { data: { categories, shops } });
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

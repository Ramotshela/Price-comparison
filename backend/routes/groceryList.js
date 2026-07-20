const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const groceryListServiceFactory = require('../services/groceryListService');
const {
  validate,
  createListSchema,
  updateBudgetSchema,
  addItemSchema,
  updateQuantitySchema,
} = require('../middleware/validate');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

module.exports = (pool) => {
  const lists = groceryListServiceFactory(pool);

  router.use(authenticate);

  // Create a new list
  router.post('/lists', validate(createListSchema), asyncHandler(async (req, res) => {
    const { name, budget } = req.body;
    const list = await lists.createList(req.user.id, name, budget);
    ApiResponse.success(res, { statusCode: 201, data: list });
  }));

  // Get all lists for the user
  router.get('/lists', asyncHandler(async (req, res) => {
    const data = await lists.getLists(req.user.id);
    ApiResponse.success(res, { data });
  }));

  // Get a single list
  router.get('/lists/:id', asyncHandler(async (req, res) => {
    const list = await lists.getListById(req.params.id, req.user.id);
    if (!list) return ApiResponse.error(res, { message: 'List not found', statusCode: 404 });
    ApiResponse.success(res, { data: list });
  }));

  // Update budget
  router.patch('/lists/:id/budget', validate(updateBudgetSchema), asyncHandler(async (req, res) => {
    const list = await lists.updateBudget(req.params.id, req.user.id, req.body.budget);
    if (!list) return ApiResponse.error(res, { message: 'List not found', statusCode: 404 });
    ApiResponse.success(res, { data: list });
  }));

  // Delete a list
  router.delete('/lists/:id', asyncHandler(async (req, res) => {
    const deleted = await lists.deleteList(req.params.id, req.user.id);
    if (!deleted) return ApiResponse.error(res, { message: 'List not found', statusCode: 404 });
    ApiResponse.success(res, { message: 'List deleted' });
  }));

  // Add item to list
  router.post('/lists/:id/items', validate(addItemSchema), asyncHandler(async (req, res) => {
    const item = await lists.addItem(req.params.id, req.user.id, req.body);
    if (!item) return ApiResponse.error(res, { message: 'List not found', statusCode: 404 });
    ApiResponse.success(res, { statusCode: 201, data: item });
  }));

  // Update item quantity
  router.patch('/lists/:listId/items/:itemId', validate(updateQuantitySchema), asyncHandler(async (req, res) => {
    const item = await lists.updateItemQuantity(
      req.params.itemId, req.params.listId, req.user.id, req.body.quantity
    );
    if (!item) return ApiResponse.error(res, { message: 'Item not found', statusCode: 404 });
    ApiResponse.success(res, { data: item });
  }));

  // Remove item from list
  router.delete('/lists/:listId/items/:itemId', asyncHandler(async (req, res) => {
    const removed = await lists.removeItem(req.params.itemId, req.params.listId, req.user.id);
    if (!removed) return ApiResponse.error(res, { message: 'Item not found', statusCode: 404 });
    ApiResponse.success(res, { message: 'Item removed' });
  }));

  return router;
};

const Joi = require('joi');
const ApiResponse = require('../utils/ApiResponse');

const insertProductsSchema = Joi.array().items(
  Joi.object({
    'Product Name': Joi.string().required(),
    Price: Joi.string().required(),
    Category: Joi.string().required(),
    'Image URL': Joi.string().uri().optional(),
    'Shop Name': Joi.string().optional(),
  })
).min(1);

const syncProductsSchema = Joi.object({
  shopName: Joi.string().required(),
  products: Joi.array().items(
    Joi.object({
      'Product Name': Joi.string().required(),
      Price: Joi.string().required(),
      Category: Joi.string().required(),
      'Image URL': Joi.string().uri().optional(),
      'Shop Name': Joi.string().optional(),
    })
  ).min(1).required(),
});

const verifyTotalSchema = Joi.object({
  productIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  userTotalPrice: Joi.number().positive().required(),
  userEmail: Joi.string().email().required(),
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  email: Joi.string().email().optional(),
}).min(1);

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

const createListSchema = Joi.object({
  name: Joi.string().max(255).optional(),
  budget: Joi.number().positive().allow(null).optional(),
});

const updateBudgetSchema = Joi.object({
  budget: Joi.number().positive().allow(null).required(),
});

const addItemSchema = Joi.object({
  product_id: Joi.string().required(),
  product_name: Joi.string().required(),
  price: Joi.string().required(),
  image_url: Joi.string().uri().allow('', null).optional(),
  quantity: Joi.number().integer().min(1).optional(),
});

const updateQuantitySchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((d) => d.message);
      return ApiResponse.error(res, { message: 'Validation failed', statusCode: 400, errors });
    }
    next();
  };
}

module.exports = {
  validate,
  insertProductsSchema,
  syncProductsSchema,
  verifyTotalSchema,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  createListSchema,
  updateBudgetSchema,
  addItemSchema,
  updateQuantitySchema,
};

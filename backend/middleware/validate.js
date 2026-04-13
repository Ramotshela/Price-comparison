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

const verifyTotalSchema = Joi.object({
  productIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  userTotalPrice: Joi.number().positive().required(),
  userEmail: Joi.string().email().required(),
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

module.exports = { validate, insertProductsSchema, verifyTotalSchema };

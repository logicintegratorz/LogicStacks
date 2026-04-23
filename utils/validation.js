const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const categorySchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow('', null).optional(),
  is_active: Joi.boolean().optional(),
});

const productSchema = Joi.object({
  name: Joi.string().min(3).max(150).required(),
  category_id: Joi.number().integer().required(),
  sku: Joi.string().max(100).allow('', null).optional(),
  supplier: Joi.string().max(150).allow('', null).optional(),
  party_price: Joi.number().min(0).allow(null).optional(),
  is_consumable: Joi.boolean().default(false),
  description: Joi.string().allow('', null).optional(),
  base_unit: Joi.string().max(50).allow('', null).optional(),
  opening_quantity: Joi.number().integer().min(0).default(0),
  opening_stock_price: Joi.number().min(0).allow(null).optional(),
  average_consumption: Joi.number().min(0).allow(null).optional(),
  min_days_required: Joi.number().integer().min(0).allow(null).optional(),
  average_delivery_days: Joi.number().integer().min(0).allow(null).optional(),
  location: Joi.string().max(150).allow('', null).optional(),
  is_reorder: Joi.boolean().default(false),
  preferred_vendor_id: Joi.number().integer().allow(null).optional(),
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('Admin', 'Manager', 'User').default('User').optional(),
});

module.exports = { loginSchema, registerSchema, categorySchema, productSchema };

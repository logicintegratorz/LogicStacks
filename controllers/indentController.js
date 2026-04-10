const Joi = require('joi');
const IndentModel = require('../models/indentModel');

// Validation Schema
const indentSchema = Joi.object({
  indentDate: Joi.date().iso().max('now').required().messages({
    'date.max': 'Indent date cannot be in the future',
    'any.required': 'Indent date is required'
  }),
  remarks: Joi.string().allow('', null),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().integer().required().messages({
        'number.base': 'Product ID must be a valid ID',
        'any.required': 'Product is required for an item'
      }),
      unit: Joi.string().allow('', null), // Read-only but we allow it
      quantity: Joi.number().positive().required().messages({
        'number.positive': 'Quantity must be a positive number',
        'any.required': 'Quantity is required'
      })
    })
  ).min(1).required().messages({
    'array.min': 'At least one product item is required in the indent',
    'any.required': 'Items are required'
  })
});

exports.createIndent = async (req, res, next) => {
  try {
    const { error, value } = indentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { indentDate, remarks, items } = value;
    
    // Create using transaction
    const newIndent = await IndentModel.create({ indentDate, remarks }, items);
    
    res.status(201).json({
      success: true,
      message: 'Indent added successfully',
      data: newIndent
    });
  } catch (error) {
    console.error('Error creating indent:', error);
    next(error);
  }
};

exports.getIndents = async (req, res, next) => {
  try {
    const indents = await IndentModel.getAll();
    res.status(200).json({
      success: true,
      data: indents
    });
  } catch (error) {
    console.error('Error fetching indents:', error);
    next(error);
  }
};

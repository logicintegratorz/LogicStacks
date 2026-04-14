const Joi = require('joi');
const IntentModel = require('../models/intentModel');

// Validation Schema
const intentSchema = Joi.object({
  indentDate: Joi.date().iso().max('now').required().messages({
    'date.max': 'Intent date cannot be in the future',
    'any.required': 'Intent date is required'
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
    'array.min': 'At least one product item is required in the intent',
    'any.required': 'Items are required'
  })
});

exports.createIntent = async (req, res, next) => {
  try {
    const { error, value } = intentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { indentDate, remarks, items } = value;
    
    // Create using transaction
    const newIntent = await IntentModel.create({ indentDate, remarks }, items);
    
    res.status(201).json({
      success: true,
      message: 'Intent added successfully',
      data: newIntent
    });
  } catch (error) {
    console.error('Error creating intent:', error);
    next(error);
  }
};

exports.getIntents = async (req, res, next) => {
  try {
    const intents = await IntentModel.getAll();
    res.status(200).json({
      success: true,
      data: intents
    });
  } catch (error) {
    console.error('Error fetching intents:', error);
    next(error);
  }
};

exports.getIntentById = async (req, res, next) => {
  try {
    const intent = await IntentModel.getById(req.params.id);
    if (!intent) {
      return res.status(404).json({ success: false, message: 'Intent not found' });
    }
    res.status(200).json({
      success: true,
      data: intent
    });
  } catch (error) {
    console.error('Error fetching intent:', error);
    next(error);
  }
};

exports.approveIntent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approval_status } = req.body;
    
    if (!['Pending', 'Approved', 'Rejected'].includes(approval_status)) {
       return res.status(400).json({ success: false, message: 'Invalid approval status' });
    }

    const updated = await IntentModel.updateApprovalStatus(id, approval_status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Intent not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Approval status updated',
      data: updated
    });
  } catch (error) {
    console.error('Error updating approval status:', error);
    next(error);
  }
};

exports.completeIntent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Complete' or 'Incomplete'

    if (!['Incomplete', 'Complete'].includes(status)) {
       return res.status(400).json({ success: false, message: 'Invalid status. Must be Complete or Incomplete.' });
    }

    // According to rule: "status becomes Complete only when ALL items are processed/fulfilled"
    // Since we are taking a straightforward PUT command from admin, we will allow it, but we can do further validation if item fulfillment is added.
    const updated = await IntentModel.updateCompleteStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Intent not found' });
    }

    res.status(200).json({
      success: true,
      message: `Intent marked as ${status}`,
      data: updated
    });
  } catch (error) {
    console.error('Error completing intent:', error);
    next(error);
  }
};

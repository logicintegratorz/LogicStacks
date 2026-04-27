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
      unit: Joi.string().allow('', null),
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
    const productid=items.map(item=>item.productId);
    if( new Set(productid).size !== productid.length){
      return res.status(400).json({ success: false, message: 'Duplicate products found' });
    }     
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

exports.getAvailableIntents = async (req, res, next) => {
  try {
    const intents = await IntentModel.getAvailable();
    res.status(200).json({ success: true, data: intents });
  } catch (error) {
    console.error('Error fetching available intents:', error);
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

    // Note: "Undo Complete" (toggling back to Incomplete) is intentionally preserved — do not restrict it
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

exports.updateIntent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Guard: only Pending intents can be edited
    const existing = await IntentModel.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Intent not found' });
    }
    if (existing.approval_status !== 'Pending') {
      return res.status(403).json({
        success: false,
        message: 'Only Pending intents can be edited'
      });
    }

    const { error, value } = intentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { indentDate, remarks, items } = value;
    const updatedIntent = await IntentModel.updateIntent(id, { indentDate, remarks }, items);

    res.status(200).json({
      success: true,
      message: 'Intent updated successfully',
      data: updatedIntent
    });
  } catch (error) {
    console.error('Error updating intent:', error);
    next(error);
  }
};

exports.deleteIntent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Guard: only Pending intents can be deleted
    const existing = await IntentModel.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Intent not found' });
    }
    if (existing.approval_status !== 'Pending') {
      return res.status(403).json({
        success: false,
        message: 'Only Pending intents can be deleted'
      });
    }

    const deletedBy = req.user ? req.user.id : null;
    const deletedIntent = await IntentModel.softDeleteIntent(id, deletedBy);

    res.status(200).json({
      success: true,
      message: 'Intent deleted successfully',
      data: deletedIntent
    });
  } catch (error) {
    console.error('Error deleting intent:', error);
    next(error);
  }
};

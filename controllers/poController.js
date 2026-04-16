const POModel = require('../models/poModel');
const VendorModel = require('../models/vendorModel');

exports.createPO = async (req, res, next) => {
  try {
    const { vendorId, poDate, remarks, termsConditions, items, parentPoId } = req.body;

    if (!vendorId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Vendor and at least one item are required' });
    }

    // Auto calculate totalAmount to prevent tampering
    let totalAmount = 0;
    const validatedItems = items.map(item => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const amount = quantity * price;
      totalAmount += amount;
      
      return {
        ...item,
        quantity,
        price,
        amount
      };
    });

    const poData = {
      intentId: req.body.intentId || null,
      vendorId,
      poDate: poDate || new Date().toISOString().split('T')[0],
      remarks,
      termsConditions,
      totalAmount,
      parentPoId
    };

    const newPO = await POModel.create(poData, validatedItems);
    
    res.status(201).json({
      success: true,
      message: 'Purchase Order created successfully',
      data: newPO
    });
  } catch (error) {
    console.error('Error creating PO:', error);
    next(error);
  }
};

exports.getPOs = async (req, res, next) => {
  try {
    const pos = await POModel.getAll();
    res.status(200).json({
      success: true,
      data: pos
    });
  } catch (error) {
    console.error('Error fetching POs:', error);
    next(error);
  }
};

exports.getPOById = async (req, res, next) => {
  try {
    const po = await POModel.getById(req.params.id);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }
    res.status(200).json({
      success: true,
      data: po
    });
  } catch (error) {
    console.error('Error fetching PO:', error);
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { field, value } = req.body;
    
    // field can be 'status' or 'approval_status'
    if (!['status', 'approval_status'].includes(field)) {
      return res.status(400).json({ success: false, message: 'Invalid field' });
    }

    const updated = await POModel.updateStatus(id, field, value);
    if (!updated) {
       return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }
    
    res.status(200).json({
      success: true,
      message: `${field} updated to ${value.toUpperCase()}`,
      data: updated
    });
  } catch (error) {
    console.error('Error updating PO status:', error);
    next(error);
  }
};

exports.getVendors = async (req, res, next) => {
  try {
    const vendors = await VendorModel.getAll();
    res.status(200).json({
      success: true,
      data: vendors
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    next(error);
  }
};

const VendorModel = require('../models/vendorModel');

exports.getVendors = async (req, res, next) => {
  try {
    const vendors = await VendorModel.getAll();
    res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    next(error);
  }
};

exports.getVendorById = async (req, res, next) => {
  try {
    const vendor = await VendorModel.getById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    next(error);
  }
};

exports.createVendor = async (req, res, next) => {
  try {
    // Only basic validation as per requirements
    if (!req.body.name) {
      return res.status(400).json({ success: false, message: 'Party Name is required' });
    }
    const newVendor = await VendorModel.create(req.body);
    res.status(201).json({ success: true, message: 'Vendor added successfully', data: newVendor });
  } catch (error) {
    console.error('Error creating vendor:', error);
    next(error);
  }
};

exports.updateVendor = async (req, res, next) => {
  try {
    const updated = await VendorModel.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.status(200).json({ success: true, message: 'Vendor updated successfully', data: updated });
  } catch (error) {
    console.error('Error updating vendor:', error);
    next(error);
  }
};

exports.deleteVendor = async (req, res, next) => {
  try {
    const deleted = await VendorModel.softDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.status(200).json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    next(error);
  }
};

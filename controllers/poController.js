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
      return { ...item, quantity, price, amount };
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

exports.createFromReorder = async (req, res, next) => {
  try {
    const ProductModel = require('../models/productModel');
    const { vendor_id, product_ids, items_with_qty } = req.body;

    const vendorId = vendor_id || req.body.vendorId;
    let selectedProductsList = product_ids || req.body.productIds;

    let itemsToProcess = [];
    if (items_with_qty && items_with_qty.length > 0) {
      itemsToProcess = items_with_qty;
    } else if (selectedProductsList && selectedProductsList.length > 0) {
      itemsToProcess = selectedProductsList.map(pid => ({ product_id: pid, quantity: 1 }));
    }

    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'Vendor is required' });
    }
    if (itemsToProcess.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one product must be selected' });
    }

    const uniqueProductIds = new Set();
    const finalItems = [];
    let totalAmount = 0;

    for (const item of itemsToProcess) {
      const pid = item.product_id || item.productId;
      if (uniqueProductIds.has(pid)) {
        return res.status(400).json({ success: false, message: 'Prevent duplicate product entries in same PO' });
      }
      uniqueProductIds.add(pid);

      const product = await ProductModel.findById(pid);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product ID ${pid} does not exist` });
      }

      const qty = Number(item.quantity) || 1;
      const price = Number(product.party_price) || 0;
      const amount = qty * price;
      totalAmount += amount;

      finalItems.push({
        productId: pid,
        quantity: qty,
        unit: product.base_unit || 'NOS',
        price,
        amount
      });
    }

    const poData = {
      vendorId,
      poDate: new Date().toISOString().split('T')[0],
      totalAmount,
      status: 'Draft',
      remarks: 'Created from Reorder Products'
    };

    const newPO = await POModel.create(poData, finalItems);

    res.status(201).json({
      success: true,
      message: 'Purchase Order created successfully',
      purchase_order_id: newPO.id,
      data: newPO
    });
  } catch (error) {
    console.error('Error creating PO from reorder:', error);
    next(error);
  }
};

exports.getPOs = async (req, res, next) => {
  try {
    const pos = await POModel.getAll();
    res.status(200).json({ success: true, data: pos });
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
    res.status(200).json({ success: true, data: po });
  } catch (error) {
    console.error('Error fetching PO:', error);
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { field, value } = req.body;

    if (!['status', 'approval_status'].includes(field)) {
      return res.status(400).json({ success: false, message: 'Invalid field' });
    }

    const updated = await POModel.updateStatus(id, field, value);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    res.status(200).json({
      success: true,
      message: `${field} updated to ${value}`,
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
    res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    next(error);
  }
};

exports.updatePO = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ── RBAC: Admin only ──
    // if (!req.user || req.user.role !== 'admin') {
    //   return res.status(403).json({ success: false, message: 'Only admins can edit Purchase Orders' });
    // }

    // ── Status lock: only Draft POs can be edited ──
    const existing = await POModel.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }
    if (existing.status !== 'Draft') {
      return res.status(400).json({ success: false, message: 'Only Draft Purchase Orders can be edited' });
    }

    const { vendorId, poDate, remarks, termsConditions, items } = req.body;

    if (!vendorId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Vendor and at least one item are required' });
    }

    let totalAmount = 0;
    const validatedItems = items.map(item => {
      const quantity = Number(item.quantity) || 0;
      if (quantity <= 0) throw new Error('Quantity must be > 0');
      const price = Number(item.price) || 0;
      const amount = quantity * price;
      totalAmount += amount;
      return { ...item, quantity, price, amount };
    });

    const productIds = validatedItems.map(item => item.productId);
    if (new Set(productIds).size !== productIds.length) {
      return res.status(400).json({ success: false, message: 'Duplicate products not allowed' });
    }

    const updatedPO = await POModel.updatePO(id, { vendorId, poDate, remarks, termsConditions, totalAmount }, validatedItems);

    res.status(200).json({
      success: true,
      message: 'Purchase Order updated successfully',
      data: updatedPO
    });
  } catch (error) {
    console.error('Error updating PO:', error);
    next(error);
  }
};

exports.deletePO = async (req, res, next) => {
  try {
    const { id } = req.params;

    // // ── RBAC: Admin only ──
    // if (!req.user || req.user.role !== 'admin') {
    //   return res.status(403).json({ success: false, message: 'Only admins can delete Purchase Orders' });
    // }

    const deletedPO = await POModel.softDeletePO(id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Purchase Order deleted successfully',
      data: deletedPO
    });
  } catch (error) {
    console.error('Error deleting PO:', error);
    next(error);
  }
};

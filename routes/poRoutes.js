const express = require('express');
const router = express.Router();
const poController = require('../controllers/poController');

// Vendor routes inside PO module context for simplicity
router.get('/vendors', poController.getVendors);

// PO routes
router.post('/', poController.createPO);
router.get('/', poController.getPOs);
router.get('/:id', poController.getPOById);
router.put('/:id/status', poController.updateStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const poController = require('../controllers/poController');

// Vendor routes inside PO module context for simplicity
router.get('/vendors', poController.getVendors);

// PO routes
router.post('/', poController.createPO);
router.post('/create-from-reorder', poController.createFromReorder);
router.get('/', poController.getPOs);
router.get('/:id', poController.getPOById);
router.put('/:id/status', poController.updateStatus);
router.put('/:id', poController.updatePO);
router.delete('/:id', poController.deletePO);

module.exports = router;


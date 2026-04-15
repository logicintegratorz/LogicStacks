const express = require('express');
const router = express.Router();
const GateEntryController = require('../controllers/gateEntryController');

// Define routes
router.get('/pending', GateEntryController.getPendingPOs);
router.post('/verify', GateEntryController.verifyAndReceive);
router.get('/', GateEntryController.getAll);
router.get('/:id', GateEntryController.getById);

module.exports = router;

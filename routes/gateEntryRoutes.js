const express = require('express');
const router = express.Router();
const GateEntryController = require('../controllers/gateEntryController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// All gate-entry routes require authentication
router.use(authMiddleware);

router.get('/pending', GateEntryController.getPendingPOs);
router.get('/vendors', GateEntryController.getVendors);
router.post('/verify', GateEntryController.verifyAndReceive);
router.get('/', GateEntryController.getAll);
router.get('/:id', GateEntryController.getById);
router.put('/:id', GateEntryController.update);

module.exports = router;

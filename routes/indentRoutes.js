const express = require('express');
const router = express.Router();
const intentController = require('../controllers/intentController');

// Using /intent but the file is currently registered as /api/indent in app.js
// So the base URL remains /api/indent if app.js isn't changed.
// That's fine, let's just make it handle the root / and /:id.

router.post('/', intentController.createIntent);
router.get('/', intentController.getIntents);
router.get('/available', intentController.getAvailableIntents);
router.get('/:id', intentController.getIntentById);
router.put('/:id/approve', intentController.approveIntent);
router.put('/:id/complete', intentController.completeIntent);
router.put('/:id', intentController.updateIntent);
router.delete('/:id', intentController.deleteIntent);

module.exports = router;

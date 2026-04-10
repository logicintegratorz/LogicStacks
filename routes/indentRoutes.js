const express = require('express');
const router = express.Router();
const indentController = require('../controllers/indentController');
const authMiddleware = require('../middlewares/authMiddleware'); // if applicable?

// In app.js or existing routes, it doesn't look like we strictly apply authMiddleware on all routes, let's keep it simple or align with others.
// The user has standard route setup. We'll simply use standard routing.

router.get('/', indentController.getIndents);
router.post('/', indentController.createIndent);

module.exports = router;

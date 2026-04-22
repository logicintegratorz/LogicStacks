const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// All issue routes require authentication
router.use(authMiddleware);

router.get('/analytics', issueController.getAnalytics);
router.get('/', issueController.getAllIssues);
router.post('/', issueController.createIssue);

module.exports = router;

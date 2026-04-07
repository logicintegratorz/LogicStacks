const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');

router.get('/analytics', issueController.getAnalytics);
router.get('/', issueController.getAllIssues);
router.post('/', issueController.createIssue);

module.exports = router;

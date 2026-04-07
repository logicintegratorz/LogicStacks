const IssueModel = require('../models/issueModel');

exports.createIssue = async (req, res, next) => {
  try {
    const { items } = req.body;
    
    // Quick validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Must provide at least one item to issue.' });
    }

    // Mocking user_id = 1 for now (if not using JWT) 
    // Ideally user is taken from req.user
    const userId = req.user ? req.user.id : 1; 

    const result = await IssueModel.createIssue(items, userId);
    res.status(201).json({ message: 'Items issued successfully', issue_id: result.issue_id });

  } catch (err) {
    // If it's a known error from validation thrown by Model
    if (err.message && err.message.includes('Insufficient') || err.message.includes('greater than 0')) {
        return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const analytics = await IssueModel.getAnalytics();
    res.json(analytics);
  } catch (err) {
    next(err);
  }
};

exports.getAllIssues = async (req, res, next) => {
  try {
    const issues = await IssueModel.getAllIssues();
    res.json(issues);
  } catch (err) {
    next(err);
  }
};

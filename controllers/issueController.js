const IssueModel = require('../models/issueModel');

exports.createIssue = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Must provide at least one item to issue.' });
    }

    for (let i = 0; i < items.length; i++) {
      const { department_id, person_name } = items[i];
      if (!department_id && !person_name) {
         return res.status(400).json({ message: `Row ${i + 1}: Must provide either Department or Person Name.` });
      }
    }

    const userId = req.user ? req.user.id : 1;
    const result = await IssueModel.createIssue(items, userId);
    res.status(201).json({ message: 'Items issued successfully', issue_id: result.issue_id });
  } catch (err) {
    if (err.message && (err.message.includes('Insufficient') || err.message.includes('greater than 0'))) {
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

// GET /api/issues — supports optional filters: category_id, department_id, product_id, date_from, date_to, person_name
exports.getAllIssues = async (req, res, next) => {
  try {
    const { category_id, department_id, product_id, date_from, date_to, person_name } = req.query;
    const issues = await IssueModel.getAllIssues({
      category_id: category_id || null,
      department_id: department_id || null,
      product_id: product_id || null,
      date_from: date_from || null,
      date_to: date_to || null,
      person_name: person_name || null
    });
    res.json(issues);
  } catch (err) {
    next(err);
  }
};

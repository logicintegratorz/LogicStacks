const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

// Public routes
router.post('/login', authController.login);

// Protected routes — only existing admins can register new users
router.post('/register', authMiddleware, adminMiddleware, authController.register);
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;

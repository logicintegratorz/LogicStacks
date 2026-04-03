const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

// All product routes require auth
router.use(authMiddleware);

router.get('/', productController.getAllProducts);
router.get('/dashboard', adminMiddleware, productController.getDashboardStats);
router.get('/:id', productController.getProductById);

// Write operations require admin auth
router.post('/', adminMiddleware, productController.createProduct);
router.put('/:id', adminMiddleware, productController.updateProduct);
router.delete('/:id', adminMiddleware, productController.deleteProduct);

module.exports = router;

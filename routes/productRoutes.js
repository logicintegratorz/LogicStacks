const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

// All product routes require auth
router.use(authMiddleware);

router.get('/', productController.getAllProducts);
router.get('/reorder', productController.getReorderProducts);
router.get('/dashboard', productController.getDashboardStats);
router.get('/:id', productController.getProductById);

// Write operations require admin auth
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;

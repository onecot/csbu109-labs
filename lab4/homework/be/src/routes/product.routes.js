// Router for /api/v1/products
// Any logged-in user can read; only admins can write.
const express = require('express');
const controller = require('../controllers/product.controller');
const requireAuth = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', controller.listProducts);
router.post('/', requireAdmin, controller.createProduct);
router.put('/:id', requireAdmin, controller.updateProduct);
router.delete('/:id', requireAdmin, controller.deleteProduct);

module.exports = router;

// Router for /api/v1/categories
// Any logged-in user can read; only admins can write.
const express = require('express');
const controller = require('../controllers/category.controller');
const requireAuth = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', controller.listCategories);
router.post('/', requireAdmin, controller.createCategory);
router.put('/:id', requireAdmin, controller.updateCategory);
router.delete('/:id', requireAdmin, controller.deleteCategory);

module.exports = router;

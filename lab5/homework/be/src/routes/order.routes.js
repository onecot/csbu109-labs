// Router for /api/v1/orders
const express = require('express');
const controller = require('../controllers/order.controller');
const requireAuth = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');

const router = express.Router();

router.use(requireAuth);

router.post('/', controller.createOrder);
router.get('/mine', controller.myOrders);
router.get('/', requireAdmin, controller.listOrders);
router.patch('/:id/status', requireAdmin, controller.updateOrderStatus);

module.exports = router;

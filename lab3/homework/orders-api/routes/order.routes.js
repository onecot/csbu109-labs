// Express Router configuration for orders
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Order creation, listing, status changes and analytics
 */

/**
 * @swagger
 * paths:
 *   /orders:
 *     get:
 *       summary: List orders (filter, paginate, JOIN customer and item count)
 *       tags: [Orders]
 *       parameters:
 *         - in: query
 *           name: status
 *           schema:
 *             type: string
 *             enum: [pending, completed, cancelled]
 *           description: Filter by order status
 *         - in: query
 *           name: customerId
 *           schema:
 *             type: integer
 *           description: Filter by customer id
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *             default: 1
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *             default: 5
 *       responses:
 *         200:
 *           description: Orders retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   count:
 *                     type: integer
 *                   pagination:
 *                     type: object
 *                     properties:
 *                       currentPage:
 *                         type: integer
 *                       totalPages:
 *                         type: integer
 *                       totalOrders:
 *                         type: integer
 *                   data:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         order_id:
 *                           type: integer
 *                         customer_name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         status:
 *                           type: string
 *                         total_amount:
 *                           type: number
 *                         total_items_count:
 *                           type: integer
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *         400:
 *           description: Invalid status or customerId filter
 *     post:
 *       summary: Create an order (atomic transaction, stock deducted)
 *       tags: [Orders]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [customerId, items]
 *               properties:
 *                 customerId:
 *                   type: integer
 *                   example: 2
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     required: [productId, quantity]
 *                     properties:
 *                       productId:
 *                         type: integer
 *                         example: 5
 *                       quantity:
 *                         type: integer
 *                         example: 2
 *       responses:
 *         201:
 *           description: Order created successfully
 *         400:
 *           description: items empty or not positive integers, or a product is out of stock
 *         404:
 *           description: Customer or product not found
 */

/**
 * @swagger
 * paths:
 *   /orders/analytics/sales-summary:
 *     get:
 *       summary: Sales revenue analytics for completed orders
 *       tags: [Orders]
 *       responses:
 *         200:
 *           description: Aggregated revenue, order count, average value and top 3 products
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   data:
 *                     type: object
 *                     properties:
 *                       totalRevenue:
 *                         type: number
 *                       completedOrdersCount:
 *                         type: integer
 *                       averageOrderValue:
 *                         type: number
 *                       topSellingProducts:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             productId:
 *                               type: integer
 *                             productName:
 *                               type: string
 *                             totalQuantitySold:
 *                               type: integer
 */

/**
 * @swagger
 * paths:
 *   /orders/{id}:
 *     get:
 *       summary: Order details with nested customer and items
 *       tags: [Orders]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Order found
 *         400:
 *           description: Invalid order id
 *         404:
 *           description: Order not found
 *     delete:
 *       summary: Delete an order (restores stock unless already cancelled)
 *       tags: [Orders]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Order deleted successfully
 *         400:
 *           description: Invalid order id
 *         404:
 *           description: Order not found
 */

/**
 * @swagger
 * paths:
 *   /orders/{id}/status:
 *     patch:
 *       summary: Update order status (cancelling restores stock)
 *       tags: [Orders]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [status]
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [pending, completed, cancelled]
 *                   example: cancelled
 *       responses:
 *         200:
 *           description: Status updated
 *         400:
 *           description: Status outside the enum, or order already cancelled
 *         404:
 *           description: Order not found
 */

// Literal analytics path must come before /:id
router.get('/analytics/sales-summary', orderController.getSalesSummary);
router.get('/', orderController.getOrders);
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/status', orderController.updateOrderStatus);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;

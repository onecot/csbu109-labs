// Express Router configuration for customers
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');

/**
 * @swagger
 * tags:
 *   - name: Customers
 *     description: Customer history and lifetime value
 */

/**
 * @swagger
 * paths:
 *   /customers/{id}/order-history:
 *     get:
 *       summary: All orders of a customer plus total spend on completed orders
 *       tags: [Customers]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Order history retrieved successfully
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
 *                       customer:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           full_name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           phone:
 *                             type: string
 *                       totalLifetimeSpent:
 *                         type: number
 *                       orders:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             status:
 *                               type: string
 *                             total_amount:
 *                               type: number
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *         400:
 *           description: Invalid customer id
 *         404:
 *           description: Customer not found
 */

router.get('/:id/order-history', customerController.getOrderHistory);

module.exports = router;

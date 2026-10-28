// Express Router configuration
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Product management endpoints
 *
 * components:
 *   parameters:
 *     IdPathParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: MongoDB ObjectId of the resource
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - price
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID from MongoDB
 *         name:
 *           type: string
 *           example: "Laptop Dell XPS 15"
 *         category:
 *           type: string
 *           enum: [Electronics, Audio, Accessories]
 *           example: "Electronics"
 *         price:
 *           type: number
 *           example: 35000000
 *         stock:
 *           type: integer
 *           example: 10
 *         description:
 *           type: string
 *           example: "15-inch laptop, 16GB RAM"
 */

/**
 * @swagger
 * paths:
 *   /products:
 *     get:
 *       summary: Get the list of products
 *       tags: [Products]
 *       parameters:
 *         - in: query
 *           name: category
 *           schema:
 *             type: string
 *             enum: [Electronics, Audio, Accessories]
 *           description: Filter by category
 *         - in: query
 *           name: minPrice
 *           schema:
 *             type: number
 *           description: Minimum price (inclusive)
 *         - in: query
 *           name: maxPrice
 *           schema:
 *             type: number
 *           description: Maximum price (inclusive)
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *             default: 1
 *           description: Current page (default = 1)
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *             default: 5
 *           description: Items per page (default = 5)
 *       responses:
 *         200:
 *           description: Products retrieved successfully
 *     post:
 *       summary: Create a new product
 *       tags: [Products]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *             example:
 *               name: "Logitech MX Master 3S"
 *               category: "Accessories"
 *               price: 99.99
 *               stock: 25
 *               description: "Ergonomic wireless mouse"
 *       responses:
 *         201:
 *           description: Product created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   message:
 *                     type: string
 *                     example: "Product created successfully"
 *                   data:
 *                     $ref: '#/components/schemas/Product'
 *         400:
 *           description: Invalid input (missing name/category/price, negative price, or category outside the enum)
 */

/**
 * @swagger
 * paths:
 *   /products/{id}:
 *     get:
 *       summary: Get a product by ID
 *       tags: [Products]
 *       parameters:
 *         - $ref: '#/components/parameters/IdPathParam'
 *       responses:
 *         200:
 *           description: Product found
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   data:
 *                     $ref: '#/components/schemas/Product'
 *         400:
 *           description: Malformed ObjectId (CastError)
 *         404:
 *           description: No product found with the given ID
 *     put:
 *       summary: Update a product by ID (only sent fields change)
 *       tags: [Products]
 *       parameters:
 *         - $ref: '#/components/parameters/IdPathParam'
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *             example:
 *               price: 1099
 *               stock: 14
 *       responses:
 *         200:
 *           description: Product updated successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   message:
 *                     type: string
 *                     example: "Product updated successfully"
 *                   data:
 *                     $ref: '#/components/schemas/Product'
 *         400:
 *           description: Invalid input or malformed ObjectId
 *         404:
 *           description: No product found to update
 *     delete:
 *       summary: Delete a product by ID
 *       tags: [Products]
 *       parameters:
 *         - $ref: '#/components/parameters/IdPathParam'
 *       responses:
 *         200:
 *           description: Product deleted successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   message:
 *                     type: string
 *                     example: "Product deleted successfully"
 *         400:
 *           description: Malformed ObjectId (CastError)
 *         404:
 *           description: No product found to delete
 */

router.get('/', productController.getAllProducts);
router.post('/', productController.createProduct);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;

// Express Router configuration
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const validateCategoryName = require('../middleware/category.validation');

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Category management endpoints
 *
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *         - slug
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID from MongoDB
 *         name:
 *           type: string
 *           example: "Home & Living"
 *         slug:
 *           type: string
 *           example: "home-living"
 *         description:
 *           type: string
 *           example: "Furniture, decor and household items"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * paths:
 *   /categories:
 *     get:
 *       summary: Get the list of categories (paginated)
 *       tags: [Categories]
 *       parameters:
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
 *           description: Categories retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   count:
 *                     type: integer
 *                     example: 5
 *                   pagination:
 *                     type: object
 *                     properties:
 *                       currentPage:
 *                         type: integer
 *                         example: 1
 *                       totalPages:
 *                         type: integer
 *                         example: 3
 *                       totalCategories:
 *                         type: integer
 *                         example: 12
 *                   data:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Category'
 *     post:
 *       summary: Create a new category
 *       tags: [Categories]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *             example:
 *               name: "Pet Supplies"
 *               slug: "pet-supplies"
 *               description: "Food, toys and care for pets"
 *       responses:
 *         201:
 *           description: Category created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   message:
 *                     type: string
 *                     example: "Category created successfully"
 *                   data:
 *                     $ref: '#/components/schemas/Category'
 *         400:
 *           description: Invalid input (name missing or shorter than 3 characters, or slug missing)
 */

/**
 * @swagger
 * paths:
 *   /categories/{id}:
 *     get:
 *       summary: Get a category by ID
 *       tags: [Categories]
 *       parameters:
 *         - $ref: '#/components/parameters/IdPathParam'
 *       responses:
 *         200:
 *           description: Category found
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   data:
 *                     $ref: '#/components/schemas/Category'
 *         400:
 *           description: Malformed ObjectId (CastError)
 *         404:
 *           description: No category found with the given ID
 *     patch:
 *       summary: Update a category by ID (partial update)
 *       tags: [Categories]
 *       parameters:
 *         - $ref: '#/components/parameters/IdPathParam'
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   minLength: 3
 *                 slug:
 *                   type: string
 *                 description:
 *                   type: string
 *             example:
 *               description: "Updated: furniture, decor, lighting and household items"
 *       responses:
 *         200:
 *           description: Category updated successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   message:
 *                     type: string
 *                     example: "Category updated successfully"
 *                   data:
 *                     $ref: '#/components/schemas/Category'
 *         400:
 *           description: Invalid name (shorter than 3 characters) or malformed ObjectId
 *         404:
 *           description: No category found to update
 *     delete:
 *       summary: Delete a category by ID
 *       tags: [Categories]
 *       parameters:
 *         - $ref: '#/components/parameters/IdPathParam'
 *       responses:
 *         200:
 *           description: Category deleted successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   message:
 *                     type: string
 *                     example: "Category deleted successfully"
 *         400:
 *           description: Malformed ObjectId (CastError)
 *         404:
 *           description: No category found to delete
 */

router.get('/', categoryController.getAllCategories);
router.post('/', validateCategoryName, categoryController.createCategory);
router.get('/:id', categoryController.getCategoryById);
router.patch('/:id', validateCategoryName, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;

// Request handlers for /api/v1/products
const Product = require('../models/product.model');
const { PRODUCTS_ROOM } = require('../socket');

const FIELDS = ['name', 'categoryId', 'quantity', 'price'];

// Copy only the fields a product is allowed to have (ignores anything else sent by the client)
const pickFields = (body) => {
  const data = {};
  for (const field of FIELDS) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  return data;
};

// GET /api/v1/products?categoryId=<id>
exports.listProducts = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.categoryId) filter.categoryId = req.query.categoryId;

    const products = await Product.find(filter).sort({ createdAt: 1, _id: 1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/products  body: { name, categoryId, quantity, price }
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(pickFields(req.body));
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/products/:id  body: { name?, categoryId?, quantity?, price? }
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      pickFields(req.body),
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Push the new data to everyone currently on the Products page
    const io = req.app.get('io');
    if (io) io.to(PRODUCTS_ROOM).emit('productUpdated', { product, updatedBy: req.user.id });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

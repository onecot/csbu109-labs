const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

// CORS: allow a Web UI on another origin to call this API
app.use(cors({
  origin: '*', // in production, list the exact origins, e.g. 'http://localhost:3000'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Simulated in-memory database
let products = [
  { id: 1, name: 'Laptop Dell XPS 15', price: 35000000, category: 'Electronics' },
  { id: 2, name: 'Logitech MX Master 3S Mouse', price: 2400000, category: 'Accessories' }
];

// GET - list all products, optional ?category=Electronics
app.get('/api/v1/products', (req, res) => {
  const { category } = req.query;
  const filtered = category
    ? products.filter(p => p.category === category)
    : products;

  res.json({
    success: true,
    count: filtered.length,
    data: filtered,
    categories: [...new Set(products.map(p => p.category))]
  });
});

// POST - create a product
app.post('/api/v1/products', (req, res) => {
  const { name, price, category } = req.body;
  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'Product name and price are required!' });
  }
  const newProduct = { id: Date.now(), name, price: Number(price), category: category || 'General' };
  products.push(newProduct);
  res.status(201).json({ success: true, message: 'Product added successfully', data: newProduct });
});

// DELETE - remove a product by id
app.delete('/api/v1/products/:id', (req, res) => {
  const productId = Number(req.params.id);
  const exists = products.some(p => p.id === productId);
  if (!exists) {
    return res.status(404).json({ success: false, message: `Product ID ${productId} not found` });
  }
  products = products.filter(p => p.id !== productId);
  res.json({ success: true, message: `Deleted product ID ${productId}` });
});

function isNumeric(value) {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'string' && value.trim() !== '') {
    return Number.isFinite(Number(value));
  }
  return false;
}

// PUT - update a product by id
app.put('/api/v1/products/:id', (req, res) => {
  const productId = Number(req.params.id);
  const product = products.find(p => p.id === productId);

  /* Product ID not found */
  if (!product) {
    return res.status(404).json({ success: false, message: `Product ID ${productId} not found` });
  }

  /* Body invalid */
  const { name, price, category } = req.body;
  if (!name || !isNumeric(price)) {
    return res.status(400).json({ success: false, message: 'Bad product name or price!' });
  }

  /* Update the stored product */
  product.name = name;
  product.price = Number(price);
  product.category = category || product.category;

  res.json({ success: true, message: `Updated product ID ${productId}`, data: product });
});

app.listen(PORT, () => {
  console.log(`Backend API running at: http://localhost:${PORT}`);
});
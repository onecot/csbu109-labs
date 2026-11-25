// Express app: middleware, routes and error handling
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');

const app = express();

// The UI runs on a different origin (Live Server), so CORS must be enabled.
// origin: true reflects whatever origin calls us, which also covers file:// (Origin: null).
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Uploaded avatars are served directly as static files (e.g. /uploads/avatar-...png)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ---------- Routes ----------
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, pid: process.pid, uptime: process.uptime() });
});

// In-class Exercise 1 evidence only: kills the worker that handles this request.
// PM2 must restart it without touching the other workers.
app.get('/dev/crash', (req, res) => {
  res.json({ success: true, pid: process.pid, message: 'crashing this worker' });
  setTimeout(() => process.exit(1), 100);
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);

// ---------- 404 + error handling (must be registered after the routes) ----------
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => (e.name === 'CastError' ? `Invalid ${e.path}` : e.message))
      .join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    message = `${field} already exists`;
  } else if (err.name === 'MulterError') {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Avatar must be 2MB or smaller' : err.message;
  } else if (status === 500) {
    console.error('Server error:', err);
  }

  res.status(status).json({ success: false, message });
});

module.exports = app;

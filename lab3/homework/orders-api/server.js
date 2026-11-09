// Main server entry point
require('dotenv').config({ quiet: true });

const express = require('express');
const { pool } = require('./config/db');
const setupSwagger = require('./config/swagger');
const orderRoutes = require('./routes/order.routes');
const customerRoutes = require('./routes/customer.routes');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

setupSwagger(app);

// Register API routes
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/customers', customerRoutes);

// Global error handler (must be registered AFTER the routes)
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);

  let status = err.status || 500;
  if (err.code === 'ER_DUP_ENTRY') status = 409; // duplicate UNIQUE value (e.g. email)
  if (err.code === 'ER_NO_REFERENCED_ROW_2') status = 400; // inserted FK does not exist
  if (err.code === 'ER_ROW_IS_REFERENCED_2') status = 400; // deleted row still referenced

  res.status(status).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

async function start() {
  try {
    await pool.query('SELECT 1');
    app.listen(PORT, () => console.log('Server API is running at: http://localhost:' + PORT));
  } catch (error) {
    console.error('MySQL connection failed:', error.message);
    process.exit(1);
  }
}

start();

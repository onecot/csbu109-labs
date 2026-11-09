// Customer queries: order history + lifetime spend
const { pool } = require('../config/db');

async function getOrderHistory(customerId) {
  const [customers] = await pool.query(
    'SELECT id, full_name, email, phone FROM customers WHERE id = ?',
    [customerId]
  );
  if (customers.length === 0) return null;

  const [orders] = await pool.query(
    `SELECT id, status, total_amount, created_at
     FROM orders
     WHERE customer_id = ?
     ORDER BY created_at DESC, id DESC`,
    [customerId]
  );

  const [[spent]] = await pool.query(
    `SELECT COALESCE(SUM(total_amount), 0) AS total_lifetime_spent
     FROM orders
     WHERE customer_id = ? AND status = 'completed'`,
    [customerId]
  );

  const customer = customers[0];
  return {
    customer: {
      id: customer.id,
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone
    },
    totalLifetimeSpent: spent.total_lifetime_spent,
    orders: orders.map((order) => ({
      id: order.id,
      status: order.status,
      total_amount: order.total_amount,
      created_at: order.created_at
    }))
  };
}

module.exports = { getOrderHistory };

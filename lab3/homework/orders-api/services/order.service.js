// Order business logic: SQL, stock handling and transactions live here
const { pool, withTransaction } = require('../config/db');
const httpError = require('../utils/httpError');

const round2 = (value) => Math.round(value * 100) / 100;

// Adds stock back for every item of an order (used by cancel and delete)
const RESTORE_STOCK_SQL = `
  UPDATE products p
  JOIN order_items oi ON oi.product_id = p.id
  SET p.stock = p.stock + oi.quantity
  WHERE oi.order_id = ?`;

// 1. Create an order: validate, lock products, insert, deduct stock, all or nothing
async function createOrder({ customerId, items }) {
  // Same product twice in one payload would bypass the stock check: merge first
  const merged = new Map();
  for (const item of items) {
    merged.set(item.productId, (merged.get(item.productId) || 0) + item.quantity);
  }
  const lines = [...merged].map(([productId, quantity]) => ({ productId, quantity }));

  const orderId = await withTransaction(async (conn) => {
    const [customers] = await conn.query('SELECT id FROM customers WHERE id = ?', [customerId]);
    if (customers.length === 0) throw httpError(404, `Customer ${customerId} not found`);

    const productIds = lines.map((line) => line.productId);
    // FOR UPDATE locks the rows so two orders cannot buy the same last item
    const [products] = await conn.query(
      'SELECT id, product_name, price, stock FROM products WHERE id IN (?) FOR UPDATE',
      [productIds]
    );
    const byId = new Map(products.map((product) => [product.id, product]));

    const missing = productIds.filter((id) => !byId.has(id));
    if (missing.length > 0) throw httpError(404, `Product not found: ${missing.join(', ')}`);

    let totalAmount = 0;
    for (const line of lines) {
      const product = byId.get(line.productId);
      if (product.stock < line.quantity) {
        throw httpError(400, `Product ${product.product_name} is out of stock`);
      }
      totalAmount += product.price * line.quantity;
    }
    totalAmount = round2(totalAmount);

    const [orderResult] = await conn.query(
      'INSERT INTO orders (customer_id, status, total_amount) VALUES (?, ?, ?)',
      [customerId, 'pending', totalAmount]
    );
    const newOrderId = orderResult.insertId;

    const itemRows = lines.map((line) => [
      newOrderId,
      line.productId,
      line.quantity,
      byId.get(line.productId).price
    ]);
    await conn.query(
      'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ?',
      [itemRows]
    );

    for (const line of lines) {
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [
        line.quantity,
        line.productId
      ]);
    }

    return newOrderId;
  });

  return getOrderById(orderId);
}

// 2. List orders with filters, pagination and JOINed customer + item count
async function listOrders({ status, customerId, page, limit }) {
  const where = [];
  const params = [];
  if (status) {
    where.push('o.status = ?');
    params.push(status);
  }
  if (customerId) {
    where.push('o.customer_id = ?');
    params.push(customerId);
  }
  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const [[countRow]] = await pool.query(`SELECT COUNT(*) AS total FROM orders o ${whereSql}`, params);
  const totalOrders = countRow.total;

  const [rows] = await pool.query(
    `SELECT o.id AS order_id, c.full_name AS customer_name, c.email, o.status,
            o.total_amount, COALESCE(SUM(oi.quantity), 0) AS total_items_count, o.created_at
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     LEFT JOIN order_items oi ON oi.order_id = o.id
     ${whereSql}
     GROUP BY o.id, o.customer_id, o.status, o.total_amount, o.created_at, c.full_name, c.email
     ORDER BY o.created_at DESC, o.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );

  return {
    totalOrders,
    totalPages: Math.ceil(totalOrders / limit),
    rows
  };
}

// 3. Order details: nested customer + items with computed subtotal
async function getOrderById(id) {
  const [orders] = await pool.query(
    `SELECT o.id, o.status, o.total_amount, o.created_at,
            c.id AS customer_id, c.full_name, c.email, c.phone
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     WHERE o.id = ?`,
    [id]
  );
  if (orders.length === 0) return null;

  const [items] = await pool.query(
    `SELECT oi.product_id, p.product_name, oi.quantity, oi.unit_price,
            ROUND(oi.quantity * oi.unit_price, 2) AS subtotal
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?
     ORDER BY oi.id`,
    [id]
  );

  const order = orders[0];
  return {
    id: order.id,
    status: order.status,
    total_amount: order.total_amount,
    created_at: order.created_at,
    customer: {
      id: order.customer_id,
      full_name: order.full_name,
      email: order.email,
      phone: order.phone
    },
    items: items.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal
    }))
  };
}

// 4. Update status; cancelling restores stock once, and cancelled is terminal
async function updateStatus(id, newStatus) {
  await withTransaction(async (conn) => {
    const [orders] = await conn.query('SELECT id, status FROM orders WHERE id = ? FOR UPDATE', [id]);
    if (orders.length === 0) throw httpError(404, `Order ${id} not found`);

    if (orders[0].status === 'cancelled') {
      throw httpError(400, 'Order is already cancelled');
    }

    if (newStatus === 'cancelled') {
      await conn.query(RESTORE_STOCK_SQL, [id]);
    }

    await conn.query('UPDATE orders SET status = ? WHERE id = ?', [newStatus, id]);
  });

  return getOrderById(id);
}

// 5. Delete an order; restore stock first unless it was already restored on cancel
async function deleteOrder(id) {
  await withTransaction(async (conn) => {
    const [orders] = await conn.query('SELECT id, status FROM orders WHERE id = ? FOR UPDATE', [id]);
    if (orders.length === 0) throw httpError(404, `Order ${id} not found`);

    if (orders[0].status !== 'cancelled') {
      await conn.query(RESTORE_STOCK_SQL, [id]);
    }

    // order_items rows are removed by ON DELETE CASCADE
    await conn.query('DELETE FROM orders WHERE id = ?', [id]);
  });
}

// 6. Sales summary: aggregation over completed orders only
async function salesSummary() {
  const [[totals]] = await pool.query(
    `SELECT COUNT(*) AS completed_orders_count,
            COALESCE(SUM(total_amount), 0) AS total_revenue,
            COALESCE(AVG(total_amount), 0) AS average_order_value
     FROM orders
     WHERE status = 'completed'`
  );

  const [topProducts] = await pool.query(
    `SELECT p.id AS product_id, p.product_name, SUM(oi.quantity) AS total_quantity_sold
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN products p ON p.id = oi.product_id
     WHERE o.status = 'completed'
     GROUP BY p.id, p.product_name
     ORDER BY total_quantity_sold DESC, p.id ASC
     LIMIT 3`
  );

  return {
    totalRevenue: round2(totals.total_revenue),
    completedOrdersCount: totals.completed_orders_count,
    averageOrderValue: round2(totals.average_order_value),
    topSellingProducts: topProducts.map((product) => ({
      productId: product.product_id,
      productName: product.product_name,
      totalQuantitySold: product.total_quantity_sold
    }))
  };
}

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  updateStatus,
  deleteOrder,
  salesSummary
};

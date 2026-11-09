// Request handlers for /api/v1/orders
const orderService = require('../services/order.service');
const parseId = require('../utils/parseId');

const STATUSES = ['pending', 'completed', 'cancelled'];
const isPositiveInt = (value) => Number.isInteger(value) && value > 0;

// Request-shape validation: returns an error message, or null when the body is valid
function validateCreateBody(body) {
  if (!body || typeof body !== 'object') return 'Request body must be a JSON object';
  if (!isPositiveInt(body.customerId)) return 'customerId must be a positive integer';
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return 'items must be a non-empty array';
  }
  for (const item of body.items) {
    if (!item || typeof item !== 'object') return 'Each item must be an object';
    if (!isPositiveInt(item.productId)) return 'Each item needs a positive integer productId';
    if (!isPositiveInt(item.quantity)) return 'Each item needs a positive integer quantity';
  }
  return null;
}

// POST /api/v1/orders
exports.createOrder = async (req, res, next) => {
  try {
    const invalid = validateCreateBody(req.body);
    if (invalid) {
      return res.status(400).json({ success: false, error: invalid });
    }

    const order = await orderService.createOrder(req.body);
    res.status(201).json({ success: true, message: 'Order created successfully', data: order });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/orders?status=&customerId=&page=&limit=
exports.getOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `status must be one of: ${STATUSES.join(', ')}`
      });
    }

    let customerId;
    if (req.query.customerId !== undefined) {
      customerId = Number(req.query.customerId);
      if (!isPositiveInt(customerId)) {
        return res.status(400).json({ success: false, error: 'customerId must be a positive integer' });
      }
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 5, 1);

    const { rows, totalOrders, totalPages } = await orderService.listOrders({
      status,
      customerId,
      page,
      limit
    });

    res.status(200).json({
      success: true,
      count: rows.length,
      pagination: { currentPage: page, totalPages, totalOrders },
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ success: false, error: 'Invalid order id' });
    }

    const order = await orderService.getOrderById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: `Order ${id} not found` });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ success: false, error: 'Invalid order id' });
    }

    const { status } = req.body || {};
    if (!STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `status must be one of: ${STATUSES.join(', ')}`
      });
    }

    const order = await orderService.updateStatus(id, status);
    res.status(200).json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/orders/:id
exports.deleteOrder = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ success: false, error: 'Invalid order id' });
    }

    await orderService.deleteOrder(id);
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/orders/analytics/sales-summary
exports.getSalesSummary = async (req, res, next) => {
  try {
    const summary = await orderService.salesSummary();
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

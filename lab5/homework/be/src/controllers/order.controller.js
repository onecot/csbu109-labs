// Order handlers: create, own history, admin list, admin status update
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const sendMail = require('../services/email.service').sendMail;

const formatMoney = (value) => Number(value).toLocaleString('en-US');

const orderEmailHtml = (order, title, note) => `
  <h2>${title}</h2>
  <p>Order <strong>#${String(order._id).slice(-6)}</strong></p>
  <ul>
    ${order.items.map((item) => `<li>${item.quantity}× ${item.name} — ${formatMoney(item.price * item.quantity)}</li>`).join('')}
  </ul>
  <p><strong>Total: ${formatMoney(order.totalAmount)}</strong></p>
  <p>Status: ${order.status}</p>
  <p>${note}</p>
`;

// POST /api/v1/orders  body: { items: [{ productId, quantity }] }
exports.createOrder = async (req, res, next) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    const products = await Product.find({ _id: { $in: items.map((item) => item.productId) } });
    const byId = new Map(products.map((product) => [String(product._id), product]));

    const orderItems = [];
    for (const item of items) {
      const product = byId.get(String(item.productId));
      if (!product) {
        return res.status(400).json({ success: false, message: `Product not found: ${item.productId}` });
      }
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ success: false, message: `Invalid quantity for ${product.name}` });
      }
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity
      });
    }

    // Total comes from the database prices, never from the client
    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({ userId: req.user.id, items: orderItems, totalAmount });

    const user = await User.findById(req.user.id);
    if (user) {
      void sendMail(user.email, `Order #${String(order._id).slice(-6)} received`, orderEmailHtml(order, 'Thanks for your order!', 'We will let you know when its status changes.'));
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/orders/mine
exports.myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/orders (admin)
exports.listOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/orders/:id/status  body: { status } (admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be pending, completed or cancelled' });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // The customer's own room receives the update, so only they see it live
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${order.userId}`).emit('orderStatusUpdated', { orderId: order._id, status: order.status });
    }

    const user = await User.findById(order.userId);
    if (user) {
      void sendMail(user.email, `Order #${String(order._id).slice(-6)} is now ${order.status}`, orderEmailHtml(order, 'Your order status changed', 'Log in to ShopAdmin to see the details.'));
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

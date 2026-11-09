// Request handlers for /api/v1/customers
const customerService = require('../services/customer.service');
const parseId = require('../utils/parseId');

// GET /api/v1/customers/:id/order-history
exports.getOrderHistory = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ success: false, error: 'Invalid customer id' });
    }

    const history = await customerService.getOrderHistory(id);
    if (!history) {
      return res.status(404).json({ success: false, message: `Customer ${id} not found` });
    }

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

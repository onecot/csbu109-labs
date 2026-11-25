// Daily revenue report for the previous calendar day (completed orders only)
const cron = require('node-cron');
const Order = require('../models/order.model');

// Production: '0 0 * * *' (midnight). For testing: REVENUE_SCHEDULE='* * * * *'.
const SCHEDULE = process.env.REVENUE_SCHEDULE || '0 0 * * *';

function startDailyRevenueReportJob() {
  cron.schedule(SCHEDULE, async () => {
    console.log(`[CRON] Running daily revenue report at ${new Date().toISOString()}`);
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - 1); // yesterday 00:00
      const end = new Date(start);
      end.setDate(end.getDate() + 1);     // today 00:00

      const [summary] = await Order.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: start, $lt: end } } },
        { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
      ]);

      // Local calendar day (toISOString would print the previous day in +07:00)
      const day = start.toLocaleDateString('en-CA');
      console.log(`[CRON] Revenue ${day}: ${summary ? summary.orders : 0} completed order(s), total ${summary ? summary.revenue : 0}`);
    } catch (error) {
      console.error('[CRON] Daily revenue report failed:', error.message);
    }
  });
}

module.exports = { startDailyRevenueReportJob };

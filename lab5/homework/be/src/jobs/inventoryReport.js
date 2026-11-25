// Daily inventory report per category (aggregation framework).
// For testing the lab runs it every minute; change the schedule to '0 0 * * *' for midnight.
const cron = require('node-cron');
const Product = require('../models/product.model');

const SCHEDULE = process.env.INVENTORY_SCHEDULE || '* * * * *';

function startInventoryReportJob() {
  cron.schedule(SCHEDULE, async () => {
    console.log(`[CRON] Running inventory report at ${new Date().toISOString()}`);
    try {
      const report = await Product.aggregate([
        {
          $group: {
            _id: '$categoryId',
            totalProducts: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            stockValue: { $sum: { $multiply: ['$price', '$quantity'] } }
          }
        },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        {
          $project: {
            _id: 0,
            category: '$category.name',
            totalProducts: 1,
            totalQuantity: 1,
            stockValue: 1
          }
        },
        { $sort: { category: 1 } }
      ]);

      console.log('[CRON] Inventory by category:');
      console.table(report);
    } catch (error) {
      // A job must never take the API down with it
      console.error('[CRON] Inventory report failed:', error.message);
    }
  });
}

module.exports = { startInventoryReportJob };

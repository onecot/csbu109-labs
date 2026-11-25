// Archive products that are out of stock and untouched for a while.
// Defaults: hourly, 24h window. For testing set ARCHIVE_AFTER_MINUTES=2 and
// ARCHIVE_SCHEDULE='* * * * *' in .env.
const cron = require('node-cron');
const Product = require('../models/product.model');

const SCHEDULE = process.env.ARCHIVE_SCHEDULE || '0 * * * *';
const AFTER_MINUTES = Number(process.env.ARCHIVE_AFTER_MINUTES || 24 * 60);

function startAutoArchiveJob() {
  cron.schedule(SCHEDULE, async () => {
    console.log(`[CRON] Running auto-archive at ${new Date().toISOString()}`);
    try {
      const cutoff = new Date(Date.now() - AFTER_MINUTES * 60 * 1000);

      // status: { $ne: 'archived' } also covers documents created before the field existed
      const result = await Product.updateMany(
        { quantity: 0, updatedAt: { $lt: cutoff }, status: { $ne: 'archived' } },
        { $set: { status: 'archived' } }
      );

      console.log(`[CRON] Auto-archive: ${result.modifiedCount} product(s) archived`);
    } catch (error) {
      console.error('[CRON] Auto-archive failed:', error.message);
    }
  });
}

module.exports = { startAutoArchiveJob };

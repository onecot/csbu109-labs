// Entry point: connect to MongoDB, then start HTTP + Socket.IO on the same server
require('dotenv').config({ quiet: true });
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');
const { startInventoryReportJob } = require('./jobs/inventoryReport');
const { startAutoArchiveJob } = require('./jobs/autoArchive');

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    // Socket.IO needs the raw http.Server, not the Express app
    const httpServer = http.createServer(app);
    const io = initSocket(httpServer);
    app.set('io', io); // controllers read it with req.app.get('io')

    httpServer.listen(PORT, () => console.log(`ShopAdmin API + Socket.IO running at http://localhost:${PORT}/api/v1`));

    // Jobs run inside this process, so start them only once (instances: 1).
    // Under PM2 cluster every worker would run its own copy.
    startInventoryReportJob();
    startAutoArchiveJob();
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });

// PM2 config for in-class Exercise 1: run the ShopAdmin API in cluster mode.
// Start from this folder: pm2 start ecosystem.config.js
const path = require('path');

module.exports = {
  apps: [
    {
      name: 'shop-api',
      script: path.join(__dirname, '../../homework/be/src/server.js'),
      cwd: path.join(__dirname, '../../homework/be'),
      instances: 4,          // 4 workers for this exercise ("max" = one per CPU core)
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    }
  ]
};

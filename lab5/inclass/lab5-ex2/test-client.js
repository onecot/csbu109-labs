// Exercise 2 test client: connects like the real UI, joins the products room,
// and prints every productUpdated event it receives.
// Usage: node test-client.js <jwt>
const { io } = require('socket.io-client');

const token = process.argv[2];
if (!token) {
  console.error('Usage: node test-client.js <jwt>');
  process.exit(1);
}

const socket = io('http://127.0.0.1:4000', { auth: { token } });

socket.on('connect', () => {
  console.log(`[client] connected (socket ${socket.id})`);
  socket.emit('products:join');
  console.log('[client] joined products room, waiting for productUpdated...');
});

socket.on('productUpdated', ({ product, updatedBy }) => {
  console.log(`[client] productUpdated: #${product._id} "${product.name}" qty=${product.quantity} price=${product.price} by=${updatedBy}`);
});

// Only admin tokens receive this (the server puts admins in the "admins" room)
socket.on('newUserRegistered', (user) => {
  console.log(`[client] newUserRegistered: ${user.fullName} (${user.email}) type=${user.type}`);
});

// Homework: sent only to the order owner's private room user:<id>
socket.on('orderStatusUpdated', (payload) => {
  console.log(`[client] orderStatusUpdated: order=${payload.orderId} status=${payload.status}`);
});

socket.on('connect_error', (err) => {
  console.error(`[client] connect_error: ${err.message}`);
  process.exit(1);
});

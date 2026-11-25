// Socket.IO setup: JWT handshake auth + "products" page room
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const PRODUCTS_ROOM = 'products';
const ADMINS_ROOM = 'admins';

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  // Reject the handshake unless the client sends a valid JWT: io(url, { auth: { token } })
  io.use((socket, next) => {
    try {
      const decoded = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userType = decoded.type;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    // Every user gets a private room (used later for order status updates)
    socket.join(`user:${socket.userId}`);
    // Only admins join the shared "admins" room, so normal users never get its events
    if (socket.userType === 'admin') socket.join(ADMINS_ROOM);
    console.log(`User ${socket.userId} connected (socket ${socket.id}, ${socket.userType})`);

    // The client tells us when it opens / leaves the Products page,
    // so updates only reach users who are currently looking at it
    socket.on('products:join', () => socket.join(PRODUCTS_ROOM));
    socket.on('products:leave', () => socket.leave(PRODUCTS_ROOM));

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected (socket ${socket.id})`);
    });
  });

  return io;
}

module.exports = { initSocket, PRODUCTS_ROOM, ADMINS_ROOM };

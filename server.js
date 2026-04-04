const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    path: '/api/socket',
  });

  // Make io accessible to API routes
  global.io = io;

  io.on('connection', (socket) => {
    // Join a chat room (roomId = listingId-buyerId-sellerId)
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
    });

    // Real-time message
    socket.on('send-message', (data) => {
      // data: { roomId, content, senderId, senderName, senderImage }
      const message = {
        ...data,
        _id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: new Date().toISOString(),
      };
      io.to(data.roomId).emit('receive-message', message);
    });

    // Offer state update broadcast
    socket.on('offer-updated', (data) => {
      // data: { roomId, offer }
      io.to(data.roomId).emit('offer-state-changed', data.offer);
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(data.roomId).emit('user-typing', { userId: data.userId, name: data.name });
    });

    socket.on('stop-typing', (data) => {
      socket.to(data.roomId).emit('user-stop-typing', { userId: data.userId });
    });

    socket.on('disconnect', () => {});
  });

  httpServer.listen(port, () => {
    console.log(`\n  ▲ Bazaar@IITGN — Next.js ${dev ? 'dev' : 'production'} mode`);
    console.log(`  - Local:    http://localhost:${port}`);
    console.log(`  - Socket.io ready\n`);
  });
});

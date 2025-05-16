const { Server } = require('socket.io');
const { logger } = require('./utils/logger');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);
    socket.on('join-server-room', (serverId) => {
      socket.join(`server:${serverId}`);
    });
    socket.on('leave-server-room', (serverId) => {
      socket.leave(`server:${serverId}`);
    });
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
}

function emitServerStatus(serverId, status) {
  if (io) io.to(`server:${serverId}`).emit('server-status', status);
}

function emitServerLogs(serverId, logs) {
  if (io) io.to(`server:${serverId}`).emit('server-logs', logs);
}

module.exports = { initSocket, emitServerStatus, emitServerLogs }; 
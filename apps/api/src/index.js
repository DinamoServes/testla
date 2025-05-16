require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/error');
const { logger } = require('./utils/logger');
const { connectDB } = require('./utils/db');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const csurf = require('csurf');
const { initSocket, emitServerStatus, emitServerLogs } = require('./socket');
const swaggerDocs = require('./swagger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const serverRoutes = require('./routes/servers');
const nodeRoutes = require('./routes/nodes');
const settingsRoutes = require('./routes/settings');

// Connect to MongoDB
connectDB();

const app = express();

// Security middleware
app.use(helmet());
// Enforce HSTS (Strict-Transport-Security)
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
// Redirect HTTP to HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, 'https://' + req.headers.host + req.url);
    }
    next();
  });
}
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Input sanitization
app.use(mongoSanitize());
app.use(xss());
// CSRF protection (for non-GET requests)
app.use(csurf({ cookie: true, ignoreMethods: ['GET', 'HEAD', 'OPTIONS'] }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/docs', swaggerDocs);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling
app.use(errorHandler);

// Handle unhandled routes
app.all('*', (req, res, next) => {
  next(new Error(`Can't find ${req.originalUrl} on this server!`));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Initialize Socket.IO
initSocket(server);

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated!');
  });
}); 
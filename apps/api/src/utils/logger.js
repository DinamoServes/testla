const winston = require('winston');
require('winston-daily-rotate-file');

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
);

const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'info',
  format: logFormat
});

const errorTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '90d',
  level: 'error',
  format: logFormat
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    transport,
    errorTransport,
    new winston.transports.Console({ format: winston.format.simple() })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ]
});

// Example: Add alert hooks for critical errors (email, Slack, etc.)
// logger.on('error', (err) => {
//   // Send alert to admin
// });

module.exports = { logger }; 
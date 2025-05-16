const express = require('express');
const { AppError } = require('../middleware/error');
const { protect, restrictTo } = require('../middleware/auth');
const Node = require('../models/node');
const Server = require('../models/server');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// Node health check
router.get('/nodes/health', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const nodes = await Node.find();
    const health = await Promise.all(nodes.map(async node => ({
      id: node._id,
      name: node.name,
      status: node.status,
      lastPing: node.lastPing,
      resources: node.resources
    })));
    res.json({ health });
  } catch (error) { next(error); }
});

// Server health check
router.get('/servers/:id/health', protect, async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return next(new AppError('Server not found', 404));
    if (req.user.role !== 'admin' && server.owner.toString() !== req.user.id) return next(new AppError('Forbidden', 403));
    res.json({
      id: server._id,
      name: server.name,
      status: server.status,
      lastStarted: server.lastStarted,
      lastStopped: server.lastStopped,
      resources: server.resources
    });
  } catch (error) { next(error); }
});

// Subscribe to alerts (user email)
router.post('/alerts/subscribe', protect, async (req, res, next) => {
  try {
    // Store user alert subscription (for demo, just acknowledge)
    // In production, store in DB and use for notifications
    res.json({ status: 'subscribed', email: req.user.email });
  } catch (error) { next(error); }
});

// Send alert notification (admin only)
router.post('/alerts/notify', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const { to, subject, message } = req.body;
    if (!to || !subject || !message) return next(new AppError('Missing fields', 400));
    await sendEmail({ to, subject, text: message });
    res.json({ status: 'sent' });
  } catch (error) { next(error); }
});

module.exports = router; 
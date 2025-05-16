const express = require('express');
const { AppError } = require('../middleware/error');
const { protect, restrictTo } = require('../middleware/auth');
const User = require('../models/user');
const AuditLog = require('../models/auditlog');
const Ticket = require('../models/ticket');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Impersonate user (admin only)
router.post('/impersonate', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return next(new AppError('User not found', 404));
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await AuditLog.create({ action: 'impersonate', admin: req.user.id, target: user._id });
    res.json({ token });
  } catch (error) { next(error); }
});

// List audit logs (admin only)
router.get('/audit-logs', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200).populate('admin', 'username').populate('target', 'username');
    res.json({ logs });
  } catch (error) { next(error); }
});

// Support tickets
// Create ticket
router.post('/tickets', protect, async (req, res, next) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) return next(new AppError('Missing fields', 400));
    const ticket = await Ticket.create({ user: req.user.id, subject, message, status: 'open' });
    res.json({ ticket });
  } catch (error) { next(error); }
});
// List tickets (admin: all, user: own)
router.get('/tickets', protect, async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { user: req.user.id };
    const tickets = await Ticket.find(query).sort({ createdAt: -1 }).populate('user', 'username email');
    res.json({ tickets });
  } catch (error) { next(error); }
});
// Update ticket status (admin only)
router.patch('/tickets/:id/status', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ ticket });
  } catch (error) { next(error); }
});

module.exports = router; 
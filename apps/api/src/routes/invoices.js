const express = require('express');
const { AppError } = require('../middleware/error');
const { protect, restrictTo } = require('../middleware/auth');
const Invoice = require('../models/invoice');
const User = require('../models/user');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// Protect all routes
router.use(protect);

// USER ROUTES
// Create a new invoice (order)
router.post('/', async (req, res, next) => {
  try {
    const { amount, currency, description } = req.body;
    if (!amount || !description) {
      return next(new AppError('Amount and description are required', 400));
    }
    const invoice = await Invoice.create({
      user: req.user.id,
      amount,
      currency: currency || 'USD',
      description
    });
    res.status(201).json({
      status: 'success',
      data: { invoice }
    });
  } catch (error) {
    next(error);
  }
});

// Get all invoices for current user
router.get('/my', async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: invoices.length,
      data: { invoices }
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific invoice (user can only see their own)
router.get('/:id', async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return next(new AppError('No invoice found with that ID', 404));
    }
    if (req.user.role !== 'admin' && String(invoice.user) !== req.user.id) {
      return next(new AppError('You do not have permission to view this invoice', 403));
    }
    res.status(200).json({
      status: 'success',
      data: { invoice }
    });
  } catch (error) {
    next(error);
  }
});

// ADMIN ROUTES
router.use(restrictTo('admin'));

// Get all invoices
router.get('/', async (req, res, next) => {
  try {
    const invoices = await Invoice.find().populate('user', 'username email').sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: invoices.length,
      data: { invoices }
    });
  } catch (error) {
    next(error);
  }
});

// Mark invoice as paid
router.patch('/:id/pay', async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('user').populate('server');
    if (!invoice) {
      return next(new AppError('No invoice found with that ID', 404));
    }
    if (invoice.status === 'paid') {
      return next(new AppError('Invoice is already marked as paid', 400));
    }
    invoice.status = 'paid';
    invoice.paidAt = new Date();
    await invoice.save();

    // Provision server if invoice is for a server order
    if (invoice.server) {
      invoice.server.status = 'running';
      invoice.server.owner = invoice.user._id;
      await invoice.server.save();
    }

    // Send email notification to user
    if (invoice.user?.email) {
      await sendEmail({
        to: invoice.user.email,
        subject: 'Your Invoice Has Been Paid',
        text: `Hello,\n\nYour invoice (${invoice._id}) has been marked as paid. Thank you!`,
        html: `<p>Hello,</p><p>Your invoice <b>${invoice._id}</b> has been marked as <b>paid</b>. Thank you!</p>`
      });
    }

    res.status(200).json({
      status: 'success',
      data: { invoice }
    });
  } catch (error) {
    next(error);
  }
});

// Mark invoice as cancelled
router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return next(new AppError('No invoice found with that ID', 404));
    }
    if (invoice.status === 'cancelled') {
      return next(new AppError('Invoice is already cancelled', 400));
    }
    invoice.status = 'cancelled';
    invoice.cancelledAt = new Date();
    await invoice.save();
    res.status(200).json({
      status: 'success',
      data: { invoice }
    });
  } catch (error) {
    next(error);
  }
});

// Add or update admin notes
router.patch('/:id/notes', async (req, res, next) => {
  try {
    const { adminNotes } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { adminNotes },
      { new: true, runValidators: true }
    );
    if (!invoice) {
      return next(new AppError('No invoice found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { invoice }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 
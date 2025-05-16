const express = require('express');
const { AppError } = require('../middleware/error');
const { protect } = require('../middleware/auth');
const Invoice = require('../models/invoice');
const axios = require('axios');

const router = express.Router();

router.use(protect);

// Create a crypto payment request (e.g., via NOWPayments API)
router.post('/create-crypto-payment', async (req, res, next) => {
  try {
    const { invoiceId, amount, currency } = req.body;
    if (!invoiceId || !amount || !currency) return next(new AppError('Missing required fields', 400));
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return next(new AppError('Invoice not found', 404));
    if (invoice.user.toString() !== req.user.id) return next(new AppError('Forbidden', 403));
    // Example: create payment via NOWPayments
    const resp = await axios.post('https://api.nowpayments.io/v1/invoice', {
      price_amount: amount,
      price_currency: currency,
      order_id: invoiceId,
      ipn_callback_url: process.env.CRYPTO_WEBHOOK_URL,
      success_url: `${process.env.FRONTEND_URL}/billing/success`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
      description: `Invoice #${invoiceId}`
    }, {
      headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY }
    });
    invoice.paymentUrl = resp.data.invoice_url;
    await invoice.save();
    res.json({ url: resp.data.invoice_url });
  } catch (error) { next(error); }
});

// Crypto payment webhook/callback
router.post('/crypto-webhook', express.json(), async (req, res) => {
  try {
    const { order_id, payment_status } = req.body;
    if (!order_id) return res.status(400).send('Missing order_id');
    const invoice = await Invoice.findById(order_id);
    if (!invoice) return res.status(404).send('Invoice not found');
    if (payment_status === 'finished') {
      invoice.status = 'paid';
      invoice.paidAt = new Date();
      await invoice.save();
    }
    res.json({ received: true });
  } catch (error) {
    res.status(500).send('Webhook error');
  }
});

// Get user's crypto invoices/payments
router.get('/my-crypto-invoices', async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id, paymentUrl: { $exists: true } });
    res.json({ invoices });
  } catch (error) { next(error); }
});

module.exports = router; 
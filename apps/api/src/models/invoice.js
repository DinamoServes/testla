const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['unpaid', 'paid', 'cancelled'],
    default: 'unpaid'
  },
  description: {
    type: String,
    required: true
  },
  adminNotes: {
    type: String
  },
  paidAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  server: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    required: false
  }
}, {
  timestamps: true
});

invoiceSchema.index({ user: 1 });
invoiceSchema.index({ status: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice; 
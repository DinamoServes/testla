const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  target: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog; 
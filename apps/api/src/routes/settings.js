const express = require('express');
const { AppError } = require('../middleware/error');
const { protect, restrictTo } = require('../middleware/auth');
const Settings = require('../models/settings');
const { logger } = require('../utils/logger');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get settings (public)
router.get('/', async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    
    // Filter out sensitive information for non-admin users
    if (req.user.role !== 'admin') {
      const publicSettings = {
        general: settings.general,
        billing: {
          currency: settings.billing.currency,
          taxRate: settings.billing.taxRate,
          minimumDeposit: settings.billing.minimumDeposit,
          paymentMethods: {
            stripe: {
              enabled: settings.billing.paymentMethods.stripe.enabled
            },
            crypto: {
              enabled: settings.billing.paymentMethods.crypto.enabled,
              providers: settings.billing.paymentMethods.crypto.providers.map(p => ({
                name: p.name,
                enabled: p.enabled
              }))
            }
          }
        },
        limits: settings.limits
      };
      
      return res.status(200).json({
        status: 'success',
        data: { settings: publicSettings }
      });
    }

    res.status(200).json({
      status: 'success',
      data: { settings }
    });
  } catch (error) {
    next(error);
  }
});

// Update settings (admin only)
router.patch('/', restrictTo('admin'), async (req, res, next) => {
  try {
    const settings = await Settings.updateSettings(req.body);

    res.status(200).json({
      status: 'success',
      data: { settings }
    });
  } catch (error) {
    next(error);
  }
});

// Get specific setting section (admin only)
router.get('/:section', restrictTo('admin'), async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    const section = req.params.section;

    if (!settings[section]) {
      return next(new AppError('Invalid settings section', 400));
    }

    res.status(200).json({
      status: 'success',
      data: { [section]: settings[section] }
    });
  } catch (error) {
    next(error);
  }
});

// Update specific setting section (admin only)
router.patch('/:section', restrictTo('admin'), async (req, res, next) => {
  try {
    const section = req.params.section;
    const settings = await Settings.getSettings();

    if (!settings[section]) {
      return next(new AppError('Invalid settings section', 400));
    }

    const updates = { [section]: req.body };
    const updatedSettings = await Settings.updateSettings(updates);

    res.status(200).json({
      status: 'success',
      data: { [section]: updatedSettings[section] }
    });
  } catch (error) {
    next(error);
  }
});

// Toggle maintenance mode (admin only)
router.post('/maintenance', restrictTo('admin'), async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    const { enabled, message } = req.body;

    settings.general.maintenance.enabled = enabled;
    if (message) {
      settings.general.maintenance.message = message;
    }

    await settings.save();

    res.status(200).json({
      status: 'success',
      data: {
        maintenance: settings.general.maintenance
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update payment method settings (admin only)
router.patch('/payment-methods/:method', restrictTo('admin'), async (req, res, next) => {
  try {
    const method = req.params.method;
    const settings = await Settings.getSettings();

    if (!settings.billing.paymentMethods[method]) {
      return next(new AppError('Invalid payment method', 400));
    }

    settings.billing.paymentMethods[method] = {
      ...settings.billing.paymentMethods[method],
      ...req.body
    };

    await settings.save();

    res.status(200).json({
      status: 'success',
      data: {
        [method]: settings.billing.paymentMethods[method]
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 
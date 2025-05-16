const express = require('express');
const { AppError } = require('../middleware/error');
const { protect } = require('../middleware/auth');
const User = require('../models/user');
const { logger } = require('../utils/logger');

const router = express.Router();

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(new AppError('User already exists', 400));
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// Update password
router.patch('/update-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check if current password is correct
    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = user.generateAuthToken();

    res.status(200).json({
      status: 'success',
      token,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Forgot password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('No user found with that email address', 404));
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send reset email
    logger.info(`Password reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to email'
    });
  } catch (error) {
    next(error);
  }
});

// Reset password
router.patch('/reset-password/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Generate new token
    const newToken = user.generateAuthToken();

    res.status(200).json({
      status: 'success',
      token: newToken,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 
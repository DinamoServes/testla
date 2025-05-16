const express = require('express');
const { AppError } = require('../middleware/error');
const { protect, restrictTo } = require('../middleware/auth');
const User = require('../models/user');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);
router.use(restrictTo('admin'));

// Get all users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// Update user
router.patch('/:id', async (req, res, next) => {
  try {
    const { username, email, role, active } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, role, active },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete('/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 
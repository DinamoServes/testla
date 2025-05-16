const jwt = require('jsonwebtoken');
const { AppError } = require('./error');
const User = require('../models/user');

const protect = async (req, res, next) => {
  try {
    // 1) Get token from header
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Please log in to access this resource', 401));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // 4) Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed password. Please log in again', 401));
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Authentication failed', 401));
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo
}; 
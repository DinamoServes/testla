const express = require('express');
const { AppError } = require('../middleware/error');
const { protect, restrictTo } = require('../middleware/auth');
const Node = require('../models/node');
const { logger } = require('../utils/logger');
const { checkNodeHealth } = require('../utils/nodeHealth');
const { findOptimalNode, STRATEGIES } = require('../utils/nodeAssignment');

const router = express.Router();

// Protect all routes
router.use(protect);

// Restrict all routes to admin only
router.use(restrictTo('admin'));

// Get all nodes
router.get('/', async (req, res, next) => {
  try {
    const nodes = await Node.find();
    
    res.status(200).json({
      status: 'success',
      results: nodes.length,
      data: { nodes }
    });
  } catch (error) {
    next(error);
  }
});

// Get node by ID
router.get('/:id', async (req, res, next) => {
  try {
    const node = await Node.findById(req.params.id);

    if (!node) {
      return next(new AppError('No node found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { node }
    });
  } catch (error) {
    next(error);
  }
});

// Create new node
router.post('/', async (req, res, next) => {
  try {
    const node = await Node.create(req.body);

    // Perform initial health check
    const health = await checkNodeHealth(node);
    if (health.status === 'offline') {
      logger.warn(`New node ${node.name} is offline: ${health.error}`);
    }

    res.status(201).json({
      status: 'success',
      data: { node, health }
    });
  } catch (error) {
    next(error);
  }
});

// Update node
router.patch('/:id', async (req, res, next) => {
  try {
    const node = await Node.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!node) {
      return next(new AppError('No node found with that ID', 404));
    }

    // Perform health check after update
    const health = await checkNodeHealth(node);

    res.status(200).json({
      status: 'success',
      data: { node, health }
    });
  } catch (error) {
    next(error);
  }
});

// Delete node
router.delete('/:id', async (req, res, next) => {
  try {
    const node = await Node.findById(req.params.id);

    if (!node) {
      return next(new AppError('No node found with that ID', 404));
    }

    // Check if node has any servers
    const servers = await Server.find({ node: node._id });
    if (servers.length > 0) {
      return next(new AppError('Cannot delete node with active servers', 400));
    }

    await node.remove();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
});

// Node control routes
router.post('/:id/maintenance', async (req, res, next) => {
  try {
    const node = await Node.findById(req.params.id);

    if (!node) {
      return next(new AppError('No node found with that ID', 404));
    }

    node.status = 'maintenance';
    await node.save();

    res.status(200).json({
      status: 'success',
      message: 'Node is now in maintenance mode'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/online', async (req, res, next) => {
  try {
    const node = await Node.findById(req.params.id);

    if (!node) {
      return next(new AppError('No node found with that ID', 404));
    }

    // Perform health check before marking as online
    const health = await checkNodeHealth(node);
    if (health.status === 'offline') {
      return next(new AppError(`Cannot bring node online: ${health.error}`, 400));
    }

    node.status = 'online';
    node.lastPing = Date.now();
    await node.save();

    res.status(200).json({
      status: 'success',
      message: 'Node is now online',
      data: { health }
    });
  } catch (error) {
    next(error);
  }
});

// Node health check
router.get('/:id/health', async (req, res, next) => {
  try {
    const node = await Node.findById(req.params.id);

    if (!node) {
      return next(new AppError('No node found with that ID', 404));
    }

    const health = await checkNodeHealth(node);
    await node.save(); // Save updated resource usage

    res.status(200).json({
      status: 'success',
      data: { health }
    });
  } catch (error) {
    next(error);
  }
});

// Find optimal node for server deployment
router.post('/find-optimal', async (req, res, next) => {
  try {
    const { requirements, strategy, userLocation } = req.body;
    
    if (!requirements) {
      return next(new AppError('Server requirements are required', 400));
    }

    const node = await findOptimalNode(
      requirements,
      strategy || STRATEGIES.LEAST_LOADED,
      userLocation
    );

    res.status(200).json({
      status: 'success',
      data: { node }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 
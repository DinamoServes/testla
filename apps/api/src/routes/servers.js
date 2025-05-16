const express = require('express');
const { AppError } = require('../middleware/error');
const { protect, restrictTo } = require('../middleware/auth');
const Server = require('../models/server');
const Node = require('../models/node');
const { findOptimalNode, STRATEGIES } = require('../utils/nodeAssignment');
const { createContainer, startContainer, stopContainer, restartContainer, getContainerStatus, getContainerLogs } = require('../utils/docker');
const { emitServerStatus, emitServerLogs } = require('../socket');
const { logger } = require('../utils/logger');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all servers (admin only)
router.get('/', restrictTo('admin'), async (req, res, next) => {
  try {
    const servers = await Server.find()
      .populate('owner', 'username email')
      .populate('node', 'name location');
    
    res.status(200).json({
      status: 'success',
      results: servers.length,
      data: { servers }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /servers/my-servers:
 *   get:
 *     summary: Get current user's servers
 *     tags: [Servers]
 *     responses:
 *       200:
 *         description: List of user's servers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     servers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Server'
 */
// Get user's servers
router.get('/my-servers', async (req, res, next) => {
  try {
    const servers = await Server.find({ owner: req.user.id })
      .populate('node', 'name location');
    
    res.status(200).json({
      status: 'success',
      results: servers.length,
      data: { servers }
    });
  } catch (error) {
    next(error);
  }
});

// Get server by ID
router.get('/:id', async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('node', 'name location');

    if (!server) {
      return next(new AppError('No server found with that ID', 404));
    }

    // Check if user is admin or owner
    if (req.user.role !== 'admin' && server.owner.id !== req.user.id) {
      return next(new AppError('You do not have permission to view this server', 403));
    }

    res.status(200).json({
      status: 'success',
      data: { server }
    });
  } catch (error) {
    next(error);
  }
});

// Create new server
router.post('/', async (req, res, next) => {
  try {
    const { name, type, resources, location } = req.body;

    // Find optimal node for server deployment
    const node = await findOptimalNode(
      resources,
      STRATEGIES.LOCATION_BASED,
      location
    );

    if (!node) {
      return next(new AppError('No suitable node found for server deployment', 400));
    }

    // Create server record
    const server = await Server.create({
      name,
      type,
      resources,
      node: node._id,
      status: 'creating'
    });

    try {
      // Allocate resources on the node
      await node.allocateResources(
        resources.cpu,
        resources.ram,
        resources.storage
      );

      // Create Docker container
      const container = await createContainer({
        name: `server-${server._id}`,
        image: getServerImage(type),
        ports: getServerPorts(type),
        env: getServerEnvironment(type),
        volumes: getServerVolumes(server._id),
        autoRestart: true
      });

      // Update server with container info
      server.containerId = container.id;
      server.status = 'running';
      await server.save();

      res.status(201).json({
        status: 'success',
        data: { server }
      });
    } catch (error) {
      // Cleanup on failure
      server.status = 'failed';
      await server.save();
      
      // Deallocate resources
      await node.deallocateResources(
        resources.cpu,
        resources.ram,
        resources.storage
      );

      logger.error(`Server creation failed: ${error.message}`);
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

// Helper functions for server configuration
function getServerImage(type) {
  const images = {
    minecraft: 'itzg/minecraft-server:latest',
    // Add more server types and their images
  };
  return images[type] || 'itzg/minecraft-server:latest';
}

function getServerPorts(type) {
  const ports = {
    minecraft: {
      '25565/tcp': [{ HostPort: '25565' }]
    }
    // Add more server types and their port mappings
  };
  return ports[type] || ports.minecraft;
}

function getServerEnvironment(type) {
  const env = {
    minecraft: [
      'EULA=TRUE',
      'TYPE=PAPER',
      'MEMORY=2G'
    ]
    // Add more server types and their environment variables
  };
  return env[type] || env.minecraft;
}

function getServerVolumes(serverId) {
  return [
    `/data/servers/${serverId}:/data`
  ];
}

// Update server
router.patch('/:id', async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);

    if (!server) {
      return next(new AppError('No server found with that ID', 404));
    }

    // Check if user is admin or owner
    if (req.user.role !== 'admin' && server.owner.id !== req.user.id) {
      return next(new AppError('You do not have permission to update this server', 403));
    }

    // Update server
    const updatedServer = await Server.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'username email')
     .populate('node', 'name location');

    res.status(200).json({
      status: 'success',
      data: { server: updatedServer }
    });
  } catch (error) {
    next(error);
  }
});

// Delete server
router.delete('/:id', async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);

    if (!server) {
      return next(new AppError('No server found with that ID', 404));
    }

    // Check if user is admin or owner
    if (req.user.role !== 'admin' && server.owner.id !== req.user.id) {
      return next(new AppError('You do not have permission to delete this server', 403));
    }

    await server.remove();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
});

// Server control routes
router.post('/:id/start', async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return next(new AppError('No server found with that ID', 404));
    if (req.user.role !== 'admin' && server.owner.toString() !== req.user.id) {
      return next(new AppError('You do not have permission to control this server', 403));
    }
    if (!server.containerId) return next(new AppError('Server not provisioned', 400));
    await startContainer(server.containerId);
    server.status = 'running';
    server.lastStarted = Date.now();
    await server.save();
    emitServerStatus(server._id, 'running');
    res.status(200).json({ status: 'success', message: 'Server is starting' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/stop', async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return next(new AppError('No server found with that ID', 404));
    if (req.user.role !== 'admin' && server.owner.toString() !== req.user.id) {
      return next(new AppError('You do not have permission to control this server', 403));
    }
    if (!server.containerId) return next(new AppError('Server not provisioned', 400));
    await stopContainer(server.containerId);
    server.status = 'stopped';
    server.lastStopped = Date.now();
    await server.save();
    emitServerStatus(server._id, 'stopped');
    res.status(200).json({ status: 'success', message: 'Server is stopping' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/restart', async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return next(new AppError('No server found with that ID', 404));
    if (req.user.role !== 'admin' && server.owner.toString() !== req.user.id) {
      return next(new AppError('You do not have permission to restart this server', 403));
    }
    if (!server.containerId) return next(new AppError('Server not provisioned', 400));
    await restartContainer(server.containerId);
    server.status = 'running';
    await server.save();
    emitServerStatus(server._id, 'running');
    res.status(200).json({ status: 'success', message: 'Server restarted' });
  } catch (error) {
    next(error);
  }
});

// Emit logs on logs endpoint
router.get('/:id/logs', async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return next(new AppError('No server found with that ID', 404));
    if (req.user.role !== 'admin' && server.owner.toString() !== req.user.id) {
      return next(new AppError('You do not have permission to view this server', 403));
    }
    if (!server.containerId) return next(new AppError('Server not provisioned', 400));
    const logs = await getContainerLogs(server.containerId);
    emitServerLogs(server._id, logs);
    res.status(200).json({ status: 'success', data: { logs } });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 
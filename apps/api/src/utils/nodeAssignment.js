const Node = require('../models/node');
const { logger } = require('./logger');

// Load balancing strategies
const STRATEGIES = {
  ROUND_ROBIN: 'round_robin',
  LEAST_LOADED: 'least_loaded',
  LOCATION_BASED: 'location_based'
};

async function findOptimalNode(requirements, strategy = STRATEGIES.LEAST_LOADED, userLocation = null) {
  try {
    // Get all online nodes
    const nodes = await Node.find({ status: 'online' });
    if (nodes.length === 0) {
      throw new Error('No online nodes available');
    }

    // Filter nodes that have enough resources
    const availableNodes = nodes.filter(node => 
      node.hasEnoughResources(
        requirements.cpu || 0,
        requirements.ram || 0,
        requirements.storage || 0
      )
    );

    if (availableNodes.length === 0) {
      throw new Error('No nodes have enough resources available');
    }

    // Apply load balancing strategy
    switch (strategy) {
      case STRATEGIES.ROUND_ROBIN:
        return getNextNodeRoundRobin(availableNodes);
      
      case STRATEGIES.LEAST_LOADED:
        return getLeastLoadedNode(availableNodes);
      
      case STRATEGIES.LOCATION_BASED:
        if (!userLocation) {
          logger.warn('Location-based strategy selected but no user location provided, falling back to least loaded');
          return getLeastLoadedNode(availableNodes);
        }
        return getClosestNode(availableNodes, userLocation);
      
      default:
        logger.warn(`Unknown strategy ${strategy}, falling back to least loaded`);
        return getLeastLoadedNode(availableNodes);
    }
  } catch (error) {
    logger.error(`Error finding optimal node: ${error.message}`);
    throw error;
  }
}

function getNextNodeRoundRobin(nodes) {
  // Simple round-robin implementation
  // In a real system, you might want to use a more sophisticated approach
  // like a distributed counter or Redis for tracking the last assigned node
  const lastAssignedNode = nodes[0]; // This should be persisted and retrieved
  const currentIndex = nodes.findIndex(node => node._id.equals(lastAssignedNode._id));
  const nextIndex = (currentIndex + 1) % nodes.length;
  return nodes[nextIndex];
}

function getLeastLoadedNode(nodes) {
  return nodes.reduce((best, current) => {
    const bestLoad = calculateNodeLoad(best);
    const currentLoad = calculateNodeLoad(current);
    return currentLoad < bestLoad ? current : best;
  });
}

function getClosestNode(nodes, userLocation) {
  // This is a simplified implementation
  // In a real system, you would want to use a proper geolocation service
  // and calculate actual network latency/distance
  return nodes.reduce((closest, current) => {
    const closestDistance = calculateDistance(userLocation, closest.location);
    const currentDistance = calculateDistance(userLocation, current.location);
    return currentDistance < closestDistance ? current : closest;
  });
}

function calculateNodeLoad(node) {
  const cpuLoad = node.resources.cpu.used / node.resources.cpu.total;
  const ramLoad = node.resources.ram.used / node.resources.ram.total;
  const storageLoad = node.resources.storage.used / node.resources.storage.total;
  
  // Weighted average of resource usage
  return (cpuLoad * 0.4 + ramLoad * 0.4 + storageLoad * 0.2);
}

function calculateDistance(location1, location2) {
  // This is a placeholder - implement actual distance calculation
  // You might want to use a geolocation service or calculate network latency
  return 0;
}

module.exports = {
  findOptimalNode,
  STRATEGIES
}; 
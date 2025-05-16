const Docker = require('dockerode');
const os = require('os');
const { logger } = require('./logger');

async function checkNodeHealth(node) {
  try {
    const docker = new Docker({
      host: node.config.host,
      port: node.config.port,
      ca: node.config.ca,
      cert: node.config.cert,
      key: node.config.key,
    });

    // Check Docker connection
    await docker.ping();

    // Get system info
    const info = await docker.info();
    
    // Get container stats
    const containers = await docker.listContainers({ all: true });
    const stats = await Promise.all(
      containers.map(async (container) => {
        const stats = await docker.getContainer(container.Id).stats({ stream: false });
        return {
          id: container.Id,
          name: container.Names[0],
          cpu: calculateCPUPercent(stats),
          memory: calculateMemoryUsage(stats),
        };
      })
    );

    // Calculate total resource usage
    const totalUsage = stats.reduce((acc, curr) => ({
      cpu: acc.cpu + curr.cpu,
      memory: acc.memory + curr.memory,
    }), { cpu: 0, memory: 0 });

    // Update node status
    node.status = 'online';
    node.lastPing = Date.now();
    node.resources.cpu.used = totalUsage.cpu;
    node.resources.ram.used = totalUsage.memory;
    node.error = null;

    return {
      status: 'online',
      resources: {
        cpu: {
          total: node.resources.cpu.total,
          used: totalUsage.cpu,
          available: node.resources.cpu.total - totalUsage.cpu
        },
        ram: {
          total: node.resources.ram.total,
          used: totalUsage.memory,
          available: node.resources.ram.total - totalUsage.memory
        },
        storage: {
          total: node.resources.storage.total,
          used: info.DockerRootDir ? await getStorageUsage(info.DockerRootDir) : 0,
          available: node.resources.storage.total - (info.DockerRootDir ? await getStorageUsage(info.DockerRootDir) : 0)
        }
      },
      containers: stats
    };
  } catch (error) {
    logger.error(`Node health check failed for ${node.name}: ${error.message}`);
    node.status = 'offline';
    node.error = error.message;
    return {
      status: 'offline',
      error: error.message
    };
  }
}

function calculateCPUPercent(stats) {
  const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
  const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
  const cpuPercent = systemDelta > 0 ? (cpuDelta / systemDelta) * stats.cpu_stats.cpu_usage.percpu_usage.length * 100 : 0;
  return cpuPercent;
}

function calculateMemoryUsage(stats) {
  return stats.memory_stats.usage || 0;
}

async function getStorageUsage(path) {
  // This is a placeholder - implement actual storage usage calculation
  // You might want to use a system command or library to get actual disk usage
  return 0;
}

module.exports = {
  checkNodeHealth
}; 
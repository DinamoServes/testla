const Docker = require('dockerode');
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock' });

// Create a new container
async function createContainer({ name, image, ports, env, cmd, volumes, autoRestart }) {
  return docker.createContainer({
    name,
    Image: image,
    Env: env,
    Cmd: cmd,
    HostConfig: {
      PortBindings: ports,
      Binds: volumes,
      RestartPolicy: autoRestart ? { Name: 'unless-stopped' } : undefined,
    },
  });
}

// Start a container
async function startContainer(containerId) {
  const container = docker.getContainer(containerId);
  await container.start();
}

// Stop a container
async function stopContainer(containerId) {
  const container = docker.getContainer(containerId);
  await container.stop();
}

// Restart a container
async function restartContainer(containerId) {
  const container = docker.getContainer(containerId);
  await container.restart();
}

// Remove a container
async function removeContainer(containerId) {
  const container = docker.getContainer(containerId);
  await container.remove({ force: true });
}

// Get container status
async function getContainerStatus(containerId) {
  const container = docker.getContainer(containerId);
  const info = await container.inspect();
  return info.State;
}

// Fetch container logs
async function getContainerLogs(containerId) {
  const container = docker.getContainer(containerId);
  const logs = await container.logs({ stdout: true, stderr: true, tail: 100, timestamps: true });
  return logs.toString();
}

// Get live container stats
async function getContainerStats(containerId) {
  const container = docker.getContainer(containerId);
  const stream = await container.stats({ stream: false });
  // Parse CPU, memory, network usage
  const cpuDelta = stream.cpu_stats.cpu_usage.total_usage - stream.precpu_stats.cpu_usage.total_usage;
  const systemDelta = stream.cpu_stats.system_cpu_usage - stream.precpu_stats.system_cpu_usage;
  const cpuPercent = systemDelta > 0 ? (cpuDelta / systemDelta) * stream.cpu_stats.cpu_usage.percpu_usage.length * 100 : 0;
  const memUsage = stream.memory_stats.usage;
  const memLimit = stream.memory_stats.limit;
  const memPercent = memLimit > 0 ? (memUsage / memLimit) * 100 : 0;
  const networks = stream.networks || {};
  return {
    cpuPercent,
    memUsage,
    memLimit,
    memPercent,
    networks,
  };
}

module.exports = {
  createContainer,
  startContainer,
  stopContainer,
  restartContainer,
  removeContainer,
  getContainerStatus,
  getContainerLogs,
  getContainerStats,
}; 
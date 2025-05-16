import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const statusColors = {
  running: 'bg-green-100 text-green-800',
  stopped: 'bg-gray-100 text-gray-800',
  starting: 'bg-yellow-100 text-yellow-800',
  stopping: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
};

export default function ServerDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [server, setServer] = useState(null);
  const [status, setStatus] = useState('');
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (id) {
      fetchServer();
      pollStatus();
      pollLogs();
      pollStats();
      const statusInterval = setInterval(pollStatus, 5000);
      const logsInterval = setInterval(pollLogs, 5000);
      const statsInterval = setInterval(pollStats, 5000);
      return () => {
        clearInterval(statusInterval);
        clearInterval(logsInterval);
        clearInterval(statsInterval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!id) return;
    // Socket.IO real-time
    const s = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
      withCredentials: true
    });
    setSocket(s);
    s.emit('join-server-room', id);
    s.on('server-status', (newStatus) => {
      setStatus(newStatus);
      setNotification(`Server status changed: ${newStatus}`);
      setTimeout(() => setNotification(''), 3000);
    });
    s.on('server-logs', (newLogs) => {
      setLogs(newLogs);
    });
    return () => {
      s.emit('leave-server-room', id);
      s.disconnect();
    };
  }, [id]);

  async function fetchServer() {
    setLoading(true);
    try {
      const res = await axios.get(`/api/servers/${id}`);
      setServer(res.data.data.server);
      setStatus(res.data.data.server.status);
    } catch (e) {
      setError('Failed to load server.');
    }
    setLoading(false);
  }

  async function pollStatus() {
    if (!id) return;
    try {
      const res = await axios.get(`/api/servers/${id}/status`);
      setStatus(res.data.data.container.Status || res.data.data.container.status || 'unknown');
    } catch {}
  }

  async function pollLogs() {
    if (!id) return;
    try {
      const res = await axios.get(`/api/servers/${id}/logs`);
      setLogs(res.data.data.logs);
    } catch {}
  }

  async function pollStats() {
    if (!id) return;
    try {
      const res = await axios.get(`/api/servers/${id}/stats`);
      setStats(res.data.data.stats);
    } catch {}
  }

  async function handleAction(action: 'start' | 'stop' | 'restart') {
    setActionLoading(action);
    try {
      await axios.post(`/api/servers/${id}/${action}`);
      await fetchServer();
      await pollStatus();
    } catch (e) {
      alert('Action failed.');
    }
    setActionLoading('');
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!server) return <div className="p-8">Server not found.</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {notification && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded">{notification}</div>
      )}
      <h1 className="text-2xl font-bold mb-4">Server: {server.name}</h1>
      <div className="mb-2"><b>Game:</b> {server.game}</div>
      <div className="mb-2"><b>Node:</b> {server.node?.name || 'N/A'}</div>
      <div className="mb-2"><b>Status:</b> <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[status]}`}>{status}</span></div>
      <div className="mb-2"><b>Port:</b> {server.config?.port || 'N/A'}</div>
      <div className="mb-2"><b>Max Players:</b> {server.config?.maxPlayers || 'N/A'}</div>
      <div className="mb-2"><b>Memory:</b> {server.config?.memory ? server.config.memory + ' MB' : 'N/A'}</div>
      {/* Resource usage placeholder */}
      <div className="mb-2"><b>Resources:</b> CPU: {server.resources?.cpu?.allocated || 0} / {server.resources?.cpu?.used || 0}, RAM: {server.resources?.ram?.allocated || 0} / {server.resources?.ram?.used || 0} MB, Storage: {server.resources?.storage?.allocated || 0} / {server.resources?.storage?.used || 0} GB</div>
      {stats && (
        <div className="mb-2">
          <b>Live Usage:</b> CPU: {stats.cpuPercent.toFixed(2)}% | RAM: {(stats.memUsage / 1024 / 1024).toFixed(1)} MB / {(stats.memLimit / 1024 / 1024).toFixed(1)} MB ({stats.memPercent.toFixed(1)}%)
          {stats.networks && Object.keys(stats.networks).length > 0 && (
            <span> | Network: {Object.entries(stats.networks).map(([iface, net]) => `${iface}: ↑${(net.tx_bytes/1024).toFixed(1)}KB ↓${(net.rx_bytes/1024).toFixed(1)}KB`).join(', ')}</span>
          )}
        </div>
      )}
      <div className="my-4 flex gap-2">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={actionLoading === 'start' || status === 'running'}
          onClick={() => handleAction('start')}
        >Start</button>
        <button
          className="bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={actionLoading === 'stop' || status === 'stopped'}
          onClick={() => handleAction('stop')}
        >Stop</button>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={actionLoading === 'restart'}
          onClick={() => handleAction('restart')}
        >Restart</button>
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Recent Logs</h2>
        <pre className="bg-gray-900 text-green-200 rounded p-4 overflow-x-auto max-h-96 whitespace-pre-wrap text-xs">{logs || 'No logs available.'}</pre>
      </div>
    </div>
  );
} 
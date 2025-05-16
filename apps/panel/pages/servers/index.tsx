import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

type Server = {
  _id: string;
  name: string;
  game: string;
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'error';
  node?: { name: string; location: string };
};

const statusColors: Record<string, string> = {
  running: 'bg-green-100 text-green-800',
  stopped: 'bg-gray-100 text-gray-800',
  starting: 'bg-yellow-100 text-yellow-800',
  stopping: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
};

export default function MyServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchServers();
  }, []);

  async function fetchServers() {
    setLoading(true);
    const res = await axios.get('/api/servers/my-servers');
    setServers(res.data.data.servers);
    setLoading(false);
  }

  async function handleAction(id: string, action: 'start' | 'stop' | 'restart') {
    setActionLoading(id + action);
    try {
      await axios.post(`/api/servers/${id}/${action}`);
      await fetchServers();
    } catch (e) {
      alert('Action failed.');
    }
    setActionLoading(null);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Servers</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Game</th>
              <th className="px-4 py-2">Node</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
            ) : servers.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8">No servers found.</td></tr>
            ) : (
              servers.map(server => (
                <tr key={server._id} className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">{server.name}</td>
                  <td className="px-4 py-2">{server.game}</td>
                  <td className="px-4 py-2">{server.node?.name || 'N/A'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[server.status]}`}>{server.status}</span>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                      disabled={actionLoading === server._id + 'start' || server.status === 'running'}
                      onClick={() => handleAction(server._id, 'start')}
                    >Start</button>
                    <button
                      className="bg-yellow-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                      disabled={actionLoading === server._id + 'stop' || server.status === 'stopped'}
                      onClick={() => handleAction(server._id, 'stop')}
                    >Stop</button>
                    <button
                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                      disabled={actionLoading === server._id + 'restart'}
                      onClick={() => handleAction(server._id, 'restart')}
                    >Restart</button>
                    <Link href={`/servers/${server._id}/logs`} className="text-blue-600 hover:underline text-xs">Logs</Link>
                    <Link href={`/servers/${server._id}`} className="text-gray-700 hover:underline text-xs">Details</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
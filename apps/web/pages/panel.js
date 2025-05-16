import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const mockServers = [
  {
    id: 'srv1',
    name: 'Minecraft Server',
    ip: '192.168.1.10',
    port: 25565,
    status: 'online',
    usage: '1.2GB / 4GB',
  },
  {
    id: 'srv2',
    name: 'Node.js App',
    ip: '192.168.1.11',
    port: 3000,
    status: 'offline',
    usage: '0GB / 2GB',
  },
];

const statusColors = {
  online: 'text-green-400',
  offline: 'text-red-400',
  starting: 'text-yellow-400',
};

export default function Panel() {
  const [servers, setServers] = useState(mockServers);
  const [actionLoading, setActionLoading] = useState({});

  const handleAction = (id, action) => {
    setActionLoading({ ...actionLoading, [id]: action });
    setTimeout(() => {
      setActionLoading({ ...actionLoading, [id]: null });
      setServers(servers => servers.map(s => s.id === id ? { ...s, status: action === 'start' ? 'online' : action === 'stop' ? 'offline' : 'starting' } : s));
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-background-dark">
      {/* Sidebar */}
      <aside className="w-64 bg-background p-6 flex flex-col gap-4 shadow-xl min-h-screen">
        <div className="text-2xl font-bold text-primary mb-8">Watersky Panel</div>
        <Link href="/panel" className="text-lg text-white hover:text-primary-light transition">Dashboard</Link>
        <Link href="/profile" className="text-lg text-white hover:text-primary-light transition">Profile</Link>
        <Link href="/settings" className="text-lg text-white hover:text-primary-light transition">Settings</Link>
        <Link href="/filemanager" className="text-lg text-white hover:text-primary-light transition">File Manager</Link>
        <Link href="/network" className="text-lg text-white hover:text-primary-light transition">Network</Link>
        <Link href="/ftp" className="text-lg text-white hover:text-primary-light transition">FTP</Link>
        <Link href="/" className="text-lg text-gray-400 hover:text-primary-light transition mt-8">Logout</Link>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-3xl font-bold text-primary mb-8">Your Servers</motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {servers.map(server => (
            <motion.div key={server.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-background rounded-xl shadow-lg p-6 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="text-xl font-semibold text-white">{server.name}</div>
                <span className={`text-sm font-bold ${statusColors[server.status]}`}>{server.status.toUpperCase()}</span>
              </div>
              <div className="text-gray-300 text-sm">IP: <span className="font-mono">{server.ip}:{server.port}</span></div>
              <div className="text-gray-300 text-sm">Usage: {server.usage}</div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleAction(server.id, 'start')} disabled={actionLoading[server.id]} className="px-4 py-1 rounded bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-50">{actionLoading[server.id] === 'start' ? 'Starting...' : 'Start'}</button>
                <button onClick={() => handleAction(server.id, 'stop')} disabled={actionLoading[server.id]} className="px-4 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50">{actionLoading[server.id] === 'stop' ? 'Stopping...' : 'Stop'}</button>
                <button onClick={() => handleAction(server.id, 'restart')} disabled={actionLoading[server.id]} className="px-4 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white font-semibold disabled:opacity-50">{actionLoading[server.id] === 'restart' ? 'Restarting...' : 'Restart'}</button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
} 
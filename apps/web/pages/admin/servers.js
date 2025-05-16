import { useState } from 'react';
import { motion } from 'framer-motion';

const mockServers = [
  { id: 1, name: 'Minecraft Server 1', node: 'US-East', status: 'running', cpu: '45%', ram: '2.5GB', owner: 'user1' },
  { id: 2, name: 'Valheim Server', node: 'EU-West', status: 'stopped', cpu: '0%', ram: '0GB', owner: 'user2' },
  { id: 3, name: 'CS:GO Server', node: 'US-West', status: 'running', cpu: '78%', ram: '4.2GB', owner: 'admin' },
];

export default function AdminServers() {
  const [servers, setServers] = useState(mockServers);
  const [search, setSearch] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-500';
      case 'stopped': return 'text-red-500';
      case 'starting': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-dark py-12">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.7 }} 
        className="text-4xl font-bold text-primary mb-8"
      >
        Manage Servers
      </motion.h1>

      <div className="w-full max-w-6xl space-y-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search servers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded bg-background text-white border border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="px-6 py-2 rounded bg-primary hover:bg-primary-dark text-white font-medium transition">
            Create Server
          </button>
        </div>

        <motion.table 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.7 }} 
          className="w-full text-left text-white bg-background rounded-xl shadow-xl"
        >
          <thead>
            <tr className="border-b border-primary">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Node</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">CPU</th>
              <th className="py-3 px-4">RAM</th>
              <th className="py-3 px-4">Owner</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {servers
              .filter(s => 
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.owner.toLowerCase().includes(search.toLowerCase())
              )
              .map(server => (
                <tr key={server.id} className="border-b border-background-dark hover:bg-background-dark/50 transition">
                  <td className="py-3 px-4">{server.name}</td>
                  <td className="py-3 px-4">{server.node}</td>
                  <td className={`py-3 px-4 ${getStatusColor(server.status)}`}>
                    {server.status}
                  </td>
                  <td className="py-3 px-4">{server.cpu}</td>
                  <td className="py-3 px-4">{server.ram}</td>
                  <td className="py-3 px-4">{server.owner}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 rounded bg-primary hover:bg-primary-dark text-white text-sm">
                        Manage
                      </button>
                      <button className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </motion.table>
      </div>
    </div>
  );
} 
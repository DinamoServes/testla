import { useState } from 'react';
import { motion } from 'framer-motion';

const mockNodes = [
  { 
    id: 1, 
    name: 'US-East-1', 
    location: 'New York',
    status: 'online',
    cpu: { used: 65, total: 100 },
    ram: { used: 32, total: 64 },
    storage: { used: 500, total: 1000 },
    servers: 12
  },
  { 
    id: 2, 
    name: 'EU-West-1', 
    location: 'Amsterdam',
    status: 'online',
    cpu: { used: 45, total: 100 },
    ram: { used: 24, total: 64 },
    storage: { used: 350, total: 1000 },
    servers: 8
  },
  { 
    id: 3, 
    name: 'US-West-1', 
    location: 'Los Angeles',
    status: 'maintenance',
    cpu: { used: 0, total: 100 },
    ram: { used: 0, total: 64 },
    storage: { used: 0, total: 1000 },
    servers: 0
  },
];

export default function AdminNodes() {
  const [nodes, setNodes] = useState(mockNodes);
  const [search, setSearch] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'maintenance': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getResourcePercentage = (used, total) => {
    return Math.round((used / total) * 100);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-dark py-12">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.7 }} 
        className="text-4xl font-bold text-primary mb-8"
      >
        Manage Nodes
      </motion.h1>

      <div className="w-full max-w-6xl space-y-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded bg-background text-white border border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="px-6 py-2 rounded bg-primary hover:bg-primary-dark text-white font-medium transition">
            Add Node
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
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">CPU Usage</th>
              <th className="py-3 px-4">RAM Usage</th>
              <th className="py-3 px-4">Storage Usage</th>
              <th className="py-3 px-4">Servers</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {nodes
              .filter(n => 
                n.name.toLowerCase().includes(search.toLowerCase()) ||
                n.location.toLowerCase().includes(search.toLowerCase())
              )
              .map(node => (
                <tr key={node.id} className="border-b border-background-dark hover:bg-background-dark/50 transition">
                  <td className="py-3 px-4">{node.name}</td>
                  <td className="py-3 px-4">{node.location}</td>
                  <td className={`py-3 px-4 ${getStatusColor(node.status)}`}>
                    {node.status}
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-background-dark rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${getResourcePercentage(node.cpu.used, node.cpu.total)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-400">
                      {node.cpu.used}/{node.cpu.total} cores
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-background-dark rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${getResourcePercentage(node.ram.used, node.ram.total)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-400">
                      {node.ram.used}/{node.ram.total} GB
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-background-dark rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${getResourcePercentage(node.storage.used, node.storage.total)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-400">
                      {node.storage.used}/{node.storage.total} GB
                    </span>
                  </td>
                  <td className="py-3 px-4">{node.servers}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 rounded bg-primary hover:bg-primary-dark text-white text-sm">
                        Manage
                      </button>
                      <button className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm">
                        Remove
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
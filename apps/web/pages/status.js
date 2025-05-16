import { motion } from 'framer-motion';

const mockStatus = [
  { name: 'Panel', status: 'operational', lastChecked: 'Just now' },
  { name: 'API', status: 'operational', lastChecked: 'Just now' },
  { name: 'Node 1', status: 'operational', lastChecked: 'Just now' },
  { name: 'Node 2', status: 'maintenance', lastChecked: '2 min ago' },
  { name: 'Payments', status: 'operational', lastChecked: 'Just now' },
];

const statusColors = {
  operational: 'text-green-400',
  maintenance: 'text-yellow-400',
  down: 'text-red-400',
};

export default function Status() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-dark py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-4xl font-bold text-primary mb-8">Service Status</motion.h1>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }} className="bg-background p-8 rounded-2xl shadow-xl max-w-2xl w-full">
        <table className="w-full text-left text-white">
          <thead>
            <tr className="border-b border-primary">
              <th className="py-2">Service</th>
              <th className="py-2">Status</th>
              <th className="py-2">Last Checked</th>
            </tr>
          </thead>
          <tbody>
            {mockStatus.map((s, i) => (
              <tr key={i} className="border-b border-background-dark hover:bg-background-dark/50 transition">
                <td className="py-2">{s.name}</td>
                <td className={`py-2 font-bold ${statusColors[s.status]}`}>{s.status.charAt(0).toUpperCase() + s.status.slice(1)}</td>
                <td className="py-2 text-gray-400">{s.lastChecked}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
} 
import { motion } from 'framer-motion';

const mockNetwork = [
  { server: 'Minecraft Server', ip: '192.168.1.10', port: 25565, usage: '12GB/mo' },
  { server: 'Node.js App', ip: '192.168.1.11', port: 3000, usage: '2GB/mo' },
];

export default function Network() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="bg-background p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">Network</h1>
        <table className="w-full text-left text-white">
          <thead>
            <tr className="border-b border-primary">
              <th className="py-2">Server</th>
              <th className="py-2">IP</th>
              <th className="py-2">Port</th>
              <th className="py-2">Usage</th>
            </tr>
          </thead>
          <tbody>
            {mockNetwork.map((n, i) => (
              <tr key={i} className="border-b border-background-dark hover:bg-background-dark/50 transition">
                <td className="py-2">{n.server}</td>
                <td className="py-2 font-mono">{n.ip}</td>
                <td className="py-2 font-mono">{n.port}</td>
                <td className="py-2">{n.usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
} 
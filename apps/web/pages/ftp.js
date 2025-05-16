import { motion } from 'framer-motion';

const mockFTP = [
  { server: 'Minecraft Server', host: 'ftp.watersky.hosting', user: 'user1', port: 21 },
  { server: 'Node.js App', host: 'ftp.watersky.hosting', user: 'user2', port: 21 },
];

export default function FTP() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="bg-background p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">FTP / SFTP Access</h1>
        <table className="w-full text-left text-white">
          <thead>
            <tr className="border-b border-primary">
              <th className="py-2">Server</th>
              <th className="py-2">Host</th>
              <th className="py-2">User</th>
              <th className="py-2">Port</th>
            </tr>
          </thead>
          <tbody>
            {mockFTP.map((f, i) => (
              <tr key={i} className="border-b border-background-dark hover:bg-background-dark/50 transition">
                <td className="py-2">{f.server}</td>
                <td className="py-2 font-mono">{f.host}</td>
                <td className="py-2 font-mono">{f.user}</td>
                <td className="py-2 font-mono">{f.port}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-gray-400 text-sm mt-4">Password is your panel password. Use FileZilla or WinSCP for best experience.</div>
      </motion.div>
    </div>
  );
} 
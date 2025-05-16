import { motion } from 'framer-motion';

export default function FileManager() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="bg-background p-8 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col items-center">
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">File Manager</h1>
        <div className="text-gray-300 text-lg mb-4 text-center">Browse, upload, and manage your server files here.<br/> (Full file manager coming soon!)</div>
        <div className="w-full h-64 bg-background-dark rounded-lg flex items-center justify-center border-2 border-dashed border-primary text-primary text-xl animate-pulse">
          File Manager UI Placeholder
        </div>
      </motion.div>
    </div>
  );
} 
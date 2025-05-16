import { motion } from 'framer-motion';
import Link from 'next/link';

const stats = [
  { label: 'Users', value: 128 },
  { label: 'Servers', value: 42 },
  { label: 'Nodes', value: 3 },
  { label: 'Pending Orders', value: 2 },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-dark py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-4xl font-bold text-primary mb-8">Admin Dashboard</motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 * i, duration: 0.7 }} className="bg-background p-8 rounded-2xl shadow-xl flex flex-col items-center">
            <div className="text-2xl font-bold text-primary mb-2">{s.label}</div>
            <div className="text-4xl font-extrabold text-white">{s.value}</div>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <Link href="/admin/users" className="px-8 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold shadow-lg transition text-center">Manage Users</Link>
        <Link href="/admin/servers" className="px-8 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold shadow-lg transition text-center">Manage Servers</Link>
        <Link href="/admin/nodes" className="px-8 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold shadow-lg transition text-center">Manage Nodes</Link>
        <Link href="/admin/settings" className="px-8 py-3 rounded-lg bg-background hover:bg-primary text-primary hover:text-white font-semibold border border-primary shadow-lg transition text-center">Settings</Link>
      </div>
    </div>
  );
} 
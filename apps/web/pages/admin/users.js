import { useState } from 'react';
import { motion } from 'framer-motion';

const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@watersky.hosting', role: 'admin', servers: 3 },
  { id: 2, username: 'user1', email: 'user1@example.com', role: 'user', servers: 1 },
  { id: 3, username: 'user2', email: 'user2@example.com', role: 'user', servers: 2 },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-dark py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-4xl font-bold text-primary mb-8">Manage Users</motion.h1>
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-6 px-4 py-2 rounded bg-background text-white border border-primary focus:outline-none focus:ring-2 focus:ring-primary w-full max-w-md"
      />
      <motion.table initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} className="w-full max-w-3xl text-left text-white bg-background rounded-xl shadow-xl">
        <thead>
          <tr className="border-b border-primary">
            <th className="py-2 px-4">Username</th>
            <th className="py-2 px-4">Email</th>
            <th className="py-2 px-4">Role</th>
            <th className="py-2 px-4">Servers</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.filter(u => u.username.includes(search) || u.email.includes(search)).map(user => (
            <tr key={user.id} className="border-b border-background-dark hover:bg-background-dark/50 transition">
              <td className="py-2 px-4">{user.username}</td>
              <td className="py-2 px-4">{user.email}</td>
              <td className="py-2 px-4">{user.role}</td>
              <td className="py-2 px-4">{user.servers}</td>
              <td className="py-2 px-4 flex gap-2">
                <button className="px-3 py-1 rounded bg-primary hover:bg-primary-dark text-white text-sm">Edit</button>
                <button className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </motion.table>
    </div>
  );
} 
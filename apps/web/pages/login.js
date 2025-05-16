import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    // TODO: Call backend API
    setTimeout(() => {
      setSuccess('Login successful! Redirecting...');
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="bg-background p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">Login to Watersky</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" type="email" required placeholder="Email" className="w-full px-4 py-2 rounded bg-background-dark text-white border border-primary focus:outline-none focus:ring-2 focus:ring-primary" value={form.email} onChange={handleChange} />
          <input name="password" type="password" required placeholder="Password" className="w-full px-4 py-2 rounded bg-background-dark text-white border border-primary focus:outline-none focus:ring-2 focus:ring-primary" value={form.password} onChange={handleChange} />
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {success && <div className="text-green-400 text-sm">{success}</div>}
          <button type="submit" disabled={loading} className="w-full py-2 rounded bg-primary hover:bg-primary-dark text-white font-semibold transition disabled:opacity-50">{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <div className="text-center text-gray-400 mt-4">
          Don&apos;t have an account? <Link href="/register" className="text-primary hover:underline">Register</Link>
        </div>
      </motion.div>
    </div>
  );
} 
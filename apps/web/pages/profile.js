import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Profile() {
  const [form, setForm] = useState({ email: 'user@example.com', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    if (form.password && form.password !== form.confirm) {
      setError('Passwords do not match.'); setLoading(false); return;
    }
    setTimeout(() => {
      setSuccess('Profile updated!'); setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="bg-background p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">Your Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" type="email" required placeholder="Email" className="w-full px-4 py-2 rounded bg-background-dark text-white border border-primary focus:outline-none focus:ring-2 focus:ring-primary" value={form.email} onChange={handleChange} />
          <input name="password" type="password" placeholder="New Password" className="w-full px-4 py-2 rounded bg-background-dark text-white border border-primary focus:outline-none focus:ring-2 focus:ring-primary" value={form.password} onChange={handleChange} />
          <input name="confirm" type="password" placeholder="Confirm New Password" className="w-full px-4 py-2 rounded bg-background-dark text-white border border-primary focus:outline-none focus:ring-2 focus:ring-primary" value={form.confirm} onChange={handleChange} />
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {success && <div className="text-green-400 text-sm">{success}</div>}
          <button type="submit" disabled={loading} className="w-full py-2 rounded bg-primary hover:bg-primary-dark text-white font-semibold transition disabled:opacity-50">{loading ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </motion.div>
    </div>
  );
} 
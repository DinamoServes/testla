import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Settings() {
  const [form, setForm] = useState({ notifications: true, theme: 'dark' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    const { name, type, checked, value } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true); setSuccess('');
    setTimeout(() => { setSuccess('Settings saved!'); setLoading(false); }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="bg-background p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">Settings</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-lg text-white">Email Notifications</label>
            <input type="checkbox" name="notifications" checked={form.notifications} onChange={handleChange} className="w-5 h-5 accent-primary" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-lg text-white">Theme</label>
            <select name="theme" value={form.theme} onChange={handleChange} className="px-3 py-1 rounded bg-background-dark text-white border border-primary">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          {success && <div className="text-green-400 text-sm">{success}</div>}
          <button type="submit" disabled={loading} className="w-full py-2 rounded bg-primary hover:bg-primary-dark text-white font-semibold transition disabled:opacity-50">{loading ? 'Saving...' : 'Save Settings'}</button>
        </form>
      </motion.div>
    </div>
  );
} 
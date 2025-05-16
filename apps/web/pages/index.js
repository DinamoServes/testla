import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background-dark text-white flex flex-col">
      <header className="w-full flex justify-between items-center px-8 py-6 bg-background">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <span className="text-3xl font-bold text-primary">Watersky Hosting</span>
        </motion.div>
        <nav className="space-x-6 text-lg">
          <a href="#panel" className="hover:text-primary-light transition">Panel</a>
          <a href="#profile" className="hover:text-primary-light transition">Profile</a>
          <Link href="/login" className="hover:text-primary-light transition">Login</Link>
          <Link href="/register" className="hover:text-primary-light transition">Register</Link>
          <a href="#store" className="hover:text-primary-light transition">Store</a>
          <a href="#about" className="hover:text-primary-light transition">About</a>
          <a href="#status" className="hover:text-primary-light transition">Status</a>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-5xl md:text-7xl font-extrabold text-primary mb-6 text-center">
          Next-Gen Hosting for <span className="text-primary-light">Servers</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-xl md:text-2xl text-gray-300 mb-8 text-center max-w-2xl">
          Watersky Hosting offers ultra-fast, secure, and scalable server hosting with a beautiful, easy-to-use panel. Pay with crypto, manage your servers, and scale with ease.
        </motion.p>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 0.7 }} className="flex flex-col md:flex-row gap-4 mb-12">
          <Link href="/register" className="px-8 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold shadow-lg transition text-center">Get Started</Link>
          <a href="#store" className="px-8 py-3 rounded-lg bg-background hover:bg-primary text-primary hover:text-white font-semibold border border-primary shadow-lg transition text-center">View Plans</a>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }} className="w-full max-w-4xl bg-background p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 text-primary">Why Watersky?</h2>
            <ul className="list-disc pl-6 text-lg text-gray-200 space-y-1">
              <li>Animated, modern, mobile-friendly UI</li>
              <li>Crypto payments (LTC, BTC, ETH, more)</li>
              <li>Admin & user panels (Pterodactyl-inspired)</li>
              <li>Container-based, scalable infrastructure</li>
              <li>Custom subdomain support</li>
              <li>Automated server setup & management</li>
              <li>Professional support</li>
            </ul>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <img src="/watersky-logo.png" alt="Watersky Hosting Logo" className="w-40 h-40 mb-4 animate-bounce" />
            <span className="text-primary-light font-bold text-lg">Your server, your sky.</span>
          </div>
        </motion.div>
      </main>
      <footer className="w-full text-center py-6 text-gray-400 bg-background mt-8">
        &copy; {new Date().getFullYear()} Watersky Hosting. All rights reserved.
      </footer>
    </div>
  );
} 
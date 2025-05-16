import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-dark py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-4xl font-bold text-primary mb-8">About Watersky Hosting</motion.h1>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }} className="bg-background p-8 rounded-2xl shadow-xl max-w-2xl text-lg text-gray-200">
        <p className="mb-4">Watersky Hosting is dedicated to providing next-generation, ultra-fast, and secure server hosting for gamers, developers, and businesses. Our platform is built with modern technology, a beautiful user experience, and a focus on automation and crypto payments.</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Animated, mobile-friendly UI</li>
          <li>Crypto payments (LTC, BTC, ETH, more)</li>
          <li>Admin & user panels (Pterodactyl-inspired)</li>
          <li>Container-based, scalable infrastructure</li>
          <li>Custom subdomain support</li>
          <li>Automated server setup & management</li>
          <li>Professional support</li>
        </ul>
        <div className="mb-2"><span className="font-bold text-primary">Contact:</span> <a href="mailto:support@watersky.hosting" className="text-primary hover:underline">support@watersky.hosting</a></div>
        <div className="mb-2"><span className="font-bold text-primary">Team:</span> Watersky Hosting Team</div>
      </motion.div>
    </div>
  );
} 
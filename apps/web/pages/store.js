import { motion } from 'framer-motion';

const plans = [
  { name: 'Basic', price: '5', ram: '2GB', cpu: '1 Core', storage: '20GB SSD', features: ['1 Server', 'Basic Support'] },
  { name: 'Pro', price: '12', ram: '6GB', cpu: '2 Cores', storage: '60GB SSD', features: ['3 Servers', 'Priority Support'] },
  { name: 'Ultimate', price: '25', ram: '16GB', cpu: '4 Cores', storage: '200GB SSD', features: ['10 Servers', 'Premium Support'] },
];

export default function Store() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-dark py-12">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-4xl font-bold text-primary mb-8">Choose Your Plan</motion.h1>
      <div className="flex flex-col md:flex-row gap-8">
        {plans.map((plan, i) => (
          <motion.div key={plan.name} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 * i, duration: 0.7 }} className="bg-background p-8 rounded-2xl shadow-xl flex flex-col items-center w-80">
            <div className="text-2xl font-bold text-primary mb-2">{plan.name}</div>
            <div className="text-4xl font-extrabold text-white mb-4">${plan.price}<span className="text-lg text-gray-400">/mo</span></div>
            <ul className="text-gray-200 mb-6 space-y-1 text-center">
              <li>{plan.ram} RAM</li>
              <li>{plan.cpu}</li>
              <li>{plan.storage}</li>
              {plan.features.map(f => <li key={f}>{f}</li>)}
            </ul>
            <a href="#pay" className="px-6 py-2 rounded bg-primary hover:bg-primary-dark text-white font-semibold shadow-lg transition text-center w-full">Pay with Crypto</a>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7 }} className="mt-12 text-center text-gray-400 max-w-xl">
        <span className="text-primary font-bold">Crypto Supported:</span> LTC, BTC, ETH, USDT, and more.<br/>
        After payment, your server will be set up and credentials sent to your email.
      </motion.div>
    </div>
  );
} 
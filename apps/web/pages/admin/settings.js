import { useState } from 'react';
import { motion } from 'framer-motion';

const initialSettings = {
  general: {
    siteName: 'Watersky Hosting',
    maintenanceMode: false,
    registrationEnabled: true,
    defaultRole: 'user',
  },
  security: {
    twoFactorRequired: true,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    passwordExpiry: 90,
  },
  email: {
    smtpHost: 'smtp.watersky.hosting',
    smtpPort: 587,
    smtpUser: 'noreply@watersky.hosting',
    smtpSecure: true,
  },
  billing: {
    currency: 'USD',
    taxRate: 0.21,
    invoicePrefix: 'WS-',
    gracePeriod: 3,
  },
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'security', label: 'Security' },
    { id: 'email', label: 'Email' },
    { id: 'billing', label: 'Billing' },
  ];

  const renderSettingField = (section, key, label, type = 'text') => {
    const value = settings[section][key];
    
    if (type === 'boolean') {
      return (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value}
            onChange={e => {
              setSettings({
                ...settings,
                [section]: { ...settings[section], [key]: e.target.checked }
              });
            }}
            className="w-4 h-4 text-primary bg-background border-primary rounded focus:ring-primary"
          />
          <span className="text-white">{label}</span>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <label className="text-white text-sm">{label}</label>
        <input
          type={type}
          value={value}
          onChange={e => {
            setSettings({
              ...settings,
              [section]: { ...settings[section], [key]: e.target.value }
            });
          }}
          className="w-full px-4 py-2 rounded bg-background text-white border border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-dark py-12">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.7 }} 
        className="text-4xl font-bold text-primary mb-8"
      >
        Settings
      </motion.h1>

      <div className="w-full max-w-4xl">
        <div className="flex gap-4 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded font-medium transition ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-background text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-background rounded-xl shadow-xl p-6 space-y-6"
        >
          {activeTab === 'general' && (
            <div className="space-y-6">
              {renderSettingField('general', 'siteName', 'Site Name')}
              {renderSettingField('general', 'maintenanceMode', 'Maintenance Mode', 'boolean')}
              {renderSettingField('general', 'registrationEnabled', 'Enable Registration', 'boolean')}
              {renderSettingField('general', 'defaultRole', 'Default User Role')}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {renderSettingField('security', 'twoFactorRequired', 'Require 2FA', 'boolean')}
              {renderSettingField('security', 'sessionTimeout', 'Session Timeout (hours)', 'number')}
              {renderSettingField('security', 'maxLoginAttempts', 'Max Login Attempts', 'number')}
              {renderSettingField('security', 'passwordExpiry', 'Password Expiry (days)', 'number')}
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              {renderSettingField('email', 'smtpHost', 'SMTP Host')}
              {renderSettingField('email', 'smtpPort', 'SMTP Port', 'number')}
              {renderSettingField('email', 'smtpUser', 'SMTP User')}
              {renderSettingField('email', 'smtpSecure', 'Use SSL/TLS', 'boolean')}
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              {renderSettingField('billing', 'currency', 'Currency')}
              {renderSettingField('billing', 'taxRate', 'Tax Rate', 'number')}
              {renderSettingField('billing', 'invoicePrefix', 'Invoice Prefix')}
              {renderSettingField('billing', 'gracePeriod', 'Grace Period (days)', 'number')}
            </div>
          )}

          <div className="flex justify-end pt-6 border-t border-background-dark">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-2 rounded bg-primary hover:bg-primary-dark text-white font-medium transition ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
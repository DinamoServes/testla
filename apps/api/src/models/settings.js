const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Settings must have a name'],
    unique: true,
    default: 'global'
  },
  general: {
    siteName: {
      type: String,
      required: [true, 'Site name is required'],
      default: 'Watersky Hosting'
    },
    siteDescription: {
      type: String,
      default: 'Professional Game Server Hosting'
    },
    maintenance: {
      enabled: {
        type: Boolean,
        default: false
      },
      message: {
        type: String,
        default: 'Site is under maintenance'
      }
    }
  },
  email: {
    from: {
      type: String,
      required: [true, 'Email from address is required']
    },
    replyTo: {
      type: String,
      required: [true, 'Email reply-to address is required']
    },
    templates: {
      welcome: {
        subject: String,
        body: String
      },
      passwordReset: {
        subject: String,
        body: String
      },
      serverCreated: {
        subject: String,
        body: String
      }
    }
  },
  billing: {
    currency: {
      type: String,
      default: 'USD'
    },
    taxRate: {
      type: Number,
      default: 0
    },
    minimumDeposit: {
      type: Number,
      default: 5
    },
    paymentMethods: {
      stripe: {
        enabled: {
          type: Boolean,
          default: false
        },
        publicKey: String,
        secretKey: String
      },
      crypto: {
        enabled: {
          type: Boolean,
          default: false
        },
        providers: [{
          name: String,
          enabled: Boolean,
          config: mongoose.Schema.Types.Mixed
        }]
      }
    }
  },
  security: {
    passwordPolicy: {
      minLength: {
        type: Number,
        default: 8
      },
      requireUppercase: {
        type: Boolean,
        default: true
      },
      requireLowercase: {
        type: Boolean,
        default: true
      },
      requireNumbers: {
        type: Boolean,
        default: true
      },
      requireSpecialChars: {
        type: Boolean,
        default: true
      }
    },
    sessionTimeout: {
      type: Number,
      default: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    },
    maxLoginAttempts: {
      type: Number,
      default: 5
    },
    lockoutDuration: {
      type: Number,
      default: 15 * 60 * 1000 // 15 minutes in milliseconds
    }
  },
  limits: {
    maxServersPerUser: {
      type: Number,
      default: 5
    },
    maxPlayersPerServer: {
      type: Number,
      default: 100
    },
    maxRamPerServer: {
      type: Number,
      default: 16384 // 16GB in MB
    },
    maxStoragePerServer: {
      type: Number,
      default: 100 // 100GB
    }
  }
}, {
  timestamps: true
});

// Indexes
settingsSchema.index({ name: 1 });

// Method to get settings
settingsSchema.statics.getSettings = async function() {
  const settings = await this.findOne({ name: 'global' });
  if (!settings) {
    return this.create({ name: 'global' });
  }
  return settings;
};

// Method to update settings
settingsSchema.statics.updateSettings = async function(updates) {
  const settings = await this.findOne({ name: 'global' });
  if (!settings) {
    return this.create({ ...updates, name: 'global' });
  }

  Object.keys(updates).forEach(key => {
    if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
      settings[key] = { ...settings[key], ...updates[key] };
    } else {
      settings[key] = updates[key];
    }
  });

  await settings.save();
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings; 
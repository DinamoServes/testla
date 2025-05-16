const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A node must have a name'],
    unique: true,
    trim: true
  },
  location: {
    type: String,
    required: [true, 'A node must have a location'],
    trim: true
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'maintenance'],
    default: 'offline'
  },
  resources: {
    cpu: {
      total: {
        type: Number,
        required: [true, 'A node must have total CPU cores']
      },
      used: {
        type: Number,
        default: 0
      }
    },
    ram: {
      total: {
        type: Number,
        required: [true, 'A node must have total RAM in MB']
      },
      used: {
        type: Number,
        default: 0
      }
    },
    storage: {
      total: {
        type: Number,
        required: [true, 'A node must have total storage in GB']
      },
      used: {
        type: Number,
        default: 0
      }
    }
  },
  config: {
    host: {
      type: String,
      required: [true, 'A node must have a host address']
    },
    port: {
      type: Number,
      required: [true, 'A node must have a port']
    },
    apiKey: {
      type: String,
      required: [true, 'A node must have an API key']
    },
    dockerSocket: {
      type: String,
      default: '/var/run/docker.sock'
    }
  },
  lastPing: {
    type: Date,
    default: Date.now
  },
  error: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
nodeSchema.index({ name: 1 });
nodeSchema.index({ status: 1 });
nodeSchema.index({ location: 1 });

// Virtual for available resources
nodeSchema.virtual('availableResources').get(function() {
  return {
    cpu: this.resources.cpu.total - this.resources.cpu.used,
    ram: this.resources.ram.total - this.resources.ram.used,
    storage: this.resources.storage.total - this.resources.storage.used
  };
});

// Method to check if node has enough resources
nodeSchema.methods.hasEnoughResources = function(cpu, ram, storage) {
  return (
    this.resources.cpu.used + cpu <= this.resources.cpu.total &&
    this.resources.ram.used + ram <= this.resources.ram.total &&
    this.resources.storage.used + storage <= this.resources.storage.total
  );
};

// Method to allocate resources
nodeSchema.methods.allocateResources = async function(cpu, ram, storage) {
  if (!this.hasEnoughResources(cpu, ram, storage)) {
    throw new Error('Not enough resources available');
  }

  this.resources.cpu.used += cpu;
  this.resources.ram.used += ram;
  this.resources.storage.used += storage;
  await this.save();
};

// Method to deallocate resources
nodeSchema.methods.deallocateResources = async function(cpu, ram, storage) {
  this.resources.cpu.used = Math.max(0, this.resources.cpu.used - cpu);
  this.resources.ram.used = Math.max(0, this.resources.ram.used - ram);
  this.resources.storage.used = Math.max(0, this.resources.storage.used - storage);
  await this.save();
};

const Node = mongoose.model('Node', nodeSchema);

module.exports = Node; 
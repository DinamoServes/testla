const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Server name is required'],
    unique: true,
    trim: true
  },
  game: {
    type: String,
    required: [true, 'Game type is required'],
    enum: ['minecraft', 'valheim', 'csgo', 'rust', 'ark']
  },
  node: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    required: [true, 'Node is required']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  status: {
    type: String,
    enum: ['running', 'stopped', 'starting', 'stopping', 'error'],
    default: 'stopped'
  },
  resources: {
    cpu: {
      allocated: Number,
      used: Number
    },
    ram: {
      allocated: Number,
      used: Number
    },
    storage: {
      allocated: Number,
      used: Number
    }
  },
  config: {
    port: Number,
    maxPlayers: Number,
    memory: Number,
    javaVersion: String,
    modpack: String,
    customSettings: mongoose.Schema.Types.Mixed
  },
  lastStarted: Date,
  lastStopped: Date,
  error: String,
  containerId: {
    type: String,
    default: null
  },
  autoRestart: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
serverSchema.index({ name: 1 });
serverSchema.index({ owner: 1 });
serverSchema.index({ node: 1 });
serverSchema.index({ status: 1 });

const Server = mongoose.model('Server', serverSchema);

module.exports = Server; 
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  // User Information
  userId: { 
    type: String, 
    required: true,
    index: true
  },
  guildId: { 
    type: String, 
    required: true,
    index: true 
  },
  username: {
    type: String,
    required: true
  },
  discriminator: String,
  
  // Moderation Action Details
  action: {
    type: String,
    required: true,
    enum: ['kick', 'ban', 'mute', 'warn', 'timeout'],
    index: true
  },
  moderatorId: {
    type: String,
    required: true
  },
  moderatorTag: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true,
    default: 'No reason provided'
  },
  
  // Action-Specific Fields
  duration: {  // For temporary actions
    type: String,
    default: null
  },
  expiresAt: {  // For timed actions
    type: Date,
    default: null
  },
  messagesDeleted: {  // For bans with message cleanup
    type: Number,
    default: 0
  },
  
  // Status Tracking
  active: {  // For temporary actions that can be undone
    type: Boolean,
    default: false
  },
  revoked: {  // If action was reversed
    type: Boolean,
    default: false
  },
  revokedBy: {  // Who reversed the action
    type: String,
    default: null
  },
  revokeReason: {
    type: String,
    default: null
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  autoIndex: true
});

// Compound index for frequent queries
memberSchema.index({ userId: 1, guildId: 1, action: 1 });

// Static method to log a kick action
memberSchema.statics.logKick = async function({
  userId,
  guildId,
  username,
  discriminator,
  moderatorId,
  moderatorTag,
  reason
}) {
  return this.create({
    userId,
    guildId,
    username,
    discriminator,
    action: 'kick',
    moderatorId,
    moderatorTag,
    reason
  });
};

// Static method to get a member's kick history
memberSchema.statics.getKickHistory = async function(userId, guildId, limit = 5) {
  return this.find({ 
    userId, 
    guildId, 
    action: 'kick' 
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .lean();
};

// Static method to get recent kicks in a guild
memberSchema.statics.getRecentKicks = async function(guildId, limit = 10) {
  return this.find({ 
    guildId, 
    action: 'kick' 
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .lean();
};

// Pre-save hook to update timestamps
memberSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;

const mongoose = require('mongoose');

const muteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  moderatorId: { type: String, required: true },
  reason: { type: String, required: true },
  duration: { type: String, required: true },
  expiresAt: { type: Date },
  active: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mute', muteSchema);

const mongoose = require('mongoose');

const banSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  moderatorId: { type: String, required: true },
  reason: { type: String, required: true },
  daysOfMessagesDeleted: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ban', banSchema);

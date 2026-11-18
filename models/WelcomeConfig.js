const mongoose = require('mongoose');

const welcomeSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  channelId: String,
  roleId: String,
  backgroundUrl: String,
  enabled: { type: Boolean, default: true },
  customMessage: String
});

module.exports = mongoose.model('WelcomeConfig', welcomeSchema);

const mongoose = require('mongoose');

const roleAssignmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  roleId: { type: String, required: true },
  action: { type: String, enum: ['add', 'remove'], required: true },
  moderatorId: { type: String, required: true },
  reason: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RoleAssignment', roleAssignmentSchema);

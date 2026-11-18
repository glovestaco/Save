const logger = require('../../utils/logger');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    logger.success(`Logged in as ${client.user.tag}`);
    
    // Set bot presence
    client.user.setPresence({
      activities: [{ name: 'with Discord.js', type: 'PLAYING' }],
      status: 'online',
    });
  },
};

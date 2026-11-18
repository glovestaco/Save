const { EmbedBuilder } = require('discord.js');
const config = require('../config/config.json');

function createEmbed(type, options = {}) {
  const embed = new EmbedBuilder();
  
  switch (type) {
    case 'success':
      embed.setColor(config.colors.success)
           .setTitle(options.title || 'Success!')
           .setDescription(options.description || 'Action completed successfully.');
      break;
    case 'error':
      embed.setColor(config.colors.error)
           .setTitle(options.title || 'Error!')
           .setDescription(options.description || 'An error occurred.');
      break;
    case 'info':
      embed.setColor(config.colors.info)
           .setTitle(options.title || 'Information')
           .setDescription(options.description || 'Here\'s some information.');
      break;
    case 'warn':
      embed.setColor(config.colors.warning)
           .setTitle(options.title || 'Warning!')
           .setDescription(options.description || 'This is a warning.');
      break;
    default:
      embed.setColor(config.colors.default)
           .setTitle(options.title || 'Default Embed')
           .setDescription(options.description || 'This is a default embed.');
  }

  if (options.fields) embed.addFields(options.fields);
  if (options.footer) embed.setFooter(options.footer);
  if (options.image) embed.setImage(options.image);
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  if (options.timestamp) embed.setTimestamp();

  return embed;
}

module.exports = { createEmbed };

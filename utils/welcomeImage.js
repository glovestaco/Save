const { generateWelcomeImage } = require('cwk-gen');
const { AttachmentBuilder } = require('discord.js');
const WelcomeConfig = require('../models/WelcomeConfig'); // Added this line

async function createWelcomeCard(member) {
  const config = await WelcomeConfig.findOne({ guildId: member.guild.id });
  
  let card;
  try {
    card = await generateWelcomeImage({
      background: config?.backgroundUrl || 'https://cwkbot.fun/welcome.png',
      avatar: member.user.displayAvatarURL({ extension: 'png', size: 256 }),
      text: [
        { text: `Welcome ${member.user.username}!`, font: 'Arial', size: 48, color: '#FFFFFF' },
        { text: `Member #${member.guild.memberCount}`, font: 'Arial', size: 32, color: '#DDDDDD' }
      ],
      blur: 0,
      rounded: true
    });
  } catch (error) {
    // Log the specific error from cwk-gen or image processing
    console.error('Error during generateWelcomeImage call in utils/welcomeImage.js:', error);
    // Re-throw the error to be caught by the calling command's error handler,
    // potentially with more context or as a custom error if desired.
    // For now, re-throwing the original error is fine.
    throw error; 
  }

  return new AttachmentBuilder(card, { name: 'welcome.png' });
}

module.exports = { createWelcomeCard };

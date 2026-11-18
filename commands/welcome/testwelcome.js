const { SlashCommandBuilder } = require('discord.js');
const { createWelcomeCard } = require('../../utils/welcomeImage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('testwelcome')
    .setDescription('Preview the welcome message'),

  async execute(interaction) {
    try {
      const attachment = await createWelcomeCard(interaction.member);
      await interaction.reply({
        content: '👋 This is how new members will be greeted:',
        files: [attachment],
        ephemeral: true
      });
    } catch (error) {
      console.error('Error executing testwelcome command:', error);
      // Check if logger is available and imported, if so, use logger.error
      // For now, console.error is a safe fallback.
      
      // Determine if the interaction has already been replied to or deferred
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '❌ Failed to generate welcome image preview. This might be due to an issue with the image generation process (e.g., a very large custom background image or temporary resource limits). Please try a smaller background image if you are using a custom one, or try again later.',
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: '❌ Failed to generate welcome image preview. This might be due to an issue with the image generation process (e.g., a very large custom background image or temporary resource limits). Please try a smaller background image if you are using a custom one, or try again later.',
          ephemeral: true
        });
      }
    }
  }
};

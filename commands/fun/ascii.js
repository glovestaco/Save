const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const figlet = require('figlet');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ascii')
    .setDescription('Generate ASCII art')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to convert')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('font')
        .setDescription('Font style')
        .setRequired(false)
        .addChoices(
          { name: 'Standard', value: 'Standard' },
          { name: '3D', value: '3D Diagonal' },
          { name: 'Banner', value: 'Banner3' }
        )),
  
  async execute(interaction) {
    const text = interaction.options.getString('text');
    const font = interaction.options.getString('font') || 'Standard';

    if (text.length > 15) {
      return interaction.reply({ 
        content: '❌ Text must be 15 characters or less.',
        ephemeral: true 
      });
    }

    figlet.text(text, { font }, (err, data) => {
      if (err) {
        return interaction.reply({ 
          content: '❌ Error generating ASCII art.',
          ephemeral: true 
        });
      }

      interaction.reply(`\`\`\`\n${data}\n\`\`\``);
    });
  }
};

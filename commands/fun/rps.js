const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play Rock Paper Scissors'),
  
  async execute(interaction) {
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('rock')
          .setLabel('🪨 Rock')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('paper')
          .setLabel('📄 Paper')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('scissors')
          .setLabel('✂️ Scissors')
          .setStyle(ButtonStyle.Primary)
      );

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🪨📄✂️ Rock Paper Scissors')
      .setDescription('Choose your move!');

    await interaction.reply({ 
      embeds: [embed], 
      components: [buttons],
      ephemeral: true 
    });
  }
};

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('flip')
    .setDescription('Flip a coin'),
  
  async execute(interaction) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const emoji = result === 'Heads' ? '🪙' : '🪙';

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`${emoji} Coin Flip`)
      .setDescription(`**${result}!**`)
      .setFooter({ text: `Flipped by ${interaction.user.tag}` });

    await interaction.reply({ embeds: [embed] });
  }
};

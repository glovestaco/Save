const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rate')
    .setDescription('Rate something')
    .addStringOption(option =>
      option.setName('thing')
        .setDescription('What to rate')
        .setRequired(true)),
  
  async execute(interaction) {
    const thing = interaction.options.getString('thing');
    const rating = Math.floor(Math.random() * 10) + 1;
    let emoji = '⭐';

    if (rating >= 9) emoji = '🌟';
    else if (rating <= 3) emoji = '💩';

    const embed = new EmbedBuilder()
      .setColor('#FFFF00')
      .setTitle('📊 Rating Machine')
      .setDescription(`I rate **${thing}** a ${rating}/10 ${emoji}`)
      .setFooter({ text: 'This rating is 100% scientific and accurate' });

    await interaction.reply({ embeds: [embed] });
  }
};

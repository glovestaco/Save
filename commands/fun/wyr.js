
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wyr')
    .setDescription('Get a "Would You Rather" question'),
  
  async execute(interaction) {
    try {
      const response = await axios.get('https://would-you-rather-api.abaanshanid.repl.co/');
      const wyr = response.data;

      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🤔 Would You Rather')
        .setDescription(`**A)** ${wyr.data[0]}\n\n**OR**\n\n**B)** ${wyr.data[1]}`)
        .setFooter({ text: 'React with A or B!' });

      const message = await interaction.reply({ 
        embeds: [embed],
        fetchReply: true 
      });
      await message.react('🇦');
      await message.react('🇧');
    } catch (error) {
      await interaction.reply({ 
        content: '❌ Failed to fetch question.',
        ephemeral: true 
      });
    }
  }
};

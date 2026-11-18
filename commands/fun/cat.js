const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cat')
    .setDescription('Get a random cat picture'),
  
  async execute(interaction) {
    try {
      const response = await axios.get('https://api.thecatapi.com/v1/images/search');
      const cat = response.data[0];

      const embed = new EmbedBuilder()
        .setColor('#FFC0CB')
        .setTitle('🐱 Random Cat')
        .setImage(cat.url)
        .setFooter({ text: 'Powered by TheCatAPI' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ 
        content: '❌ Failed to fetch cat picture.',
        ephemeral: true 
      });
    }
  }
};

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get a random joke'),
  
  async execute(interaction) {
    try {
      const response = await axios.get('https://v2.jokeapi.dev/joke/Any?safe-mode');
      const joke = response.data;

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('😂 Random Joke');

      if (joke.type === 'single') {
        embed.setDescription(joke.joke);
      } else {
        embed.addFields(
          { name: 'Setup', value: joke.setup },
          { name: 'Punchline', value: joke.delivery }
        );
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ 
        content: '❌ Failed to fetch joke.',
        ephemeral: true 
      });
    }
  }
};

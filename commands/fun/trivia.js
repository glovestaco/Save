const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Start a trivia quiz')
    .addStringOption(option =>
      option.setName('difficulty')
        .setDescription('Quiz difficulty')
        .setRequired(false)
        .addChoices(
          { name: 'Easy', value: 'easy' },
          { name: 'Medium', value: 'medium' },
          { name: 'Hard', value: 'hard' }
        )),
  
  async execute(interaction) {
    const difficulty = interaction.options.getString('difficulty') || 'medium';

    try {
      const response = await axios.get(`https://opentdb.com/api.php?amount=1&difficulty=${difficulty}`);
      const question = response.data.results[0];
      
      const answers = [...question.incorrect_answers, question.correct_answer]
        .sort(() => Math.random() - 0.5);

      const buttons = new ActionRowBuilder();
      answers.forEach((answer, i) => {
        buttons.addComponents(
          new ButtonBuilder()
            .setCustomId(`answer_${i}`)
            .setLabel(answer)
            .setStyle(ButtonStyle.Secondary)
        );
      });

      const embed = new EmbedBuilder()
        .setColor('#7289DA')
        .setTitle('❓ Trivia Question')
        .setDescription(question.question)
        .addFields(
          { name: 'Category', value: question.category, inline: true },
          { name: 'Difficulty', value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1), inline: true }
        );

      await interaction.reply({ 
        embeds: [embed], 
        components: [buttons] 
      });
    } catch (error) {
      await interaction.reply({ 
        content: '❌ Failed to fetch trivia question.',
        ephemeral: true 
      });
    }
  }
};

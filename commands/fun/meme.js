const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme from Reddit')
    .addStringOption(option =>
      option.setName('subreddit')
        .setDescription('Subreddit to fetch from (default: dankmemes)')
        .setRequired(false)),
  
  async execute(interaction) {
    const subreddit = interaction.options.getString('subreddit') || 'dankmemes';

    try {
      const response = await axios.get(`https://www.reddit.com/r/${subreddit}/hot.json?limit=100`);
      const posts = response.data.data.children.filter(post => post.data.post_hint === 'image');
      
      if (!posts.length) throw new Error('No memes found');
      
      const randomPost = posts[Math.floor(Math.random() * posts.length)].data;
      
      const embed = new EmbedBuilder()
        .setColor('#FF5700')
        .setTitle(randomPost.title)
        .setURL(`https://reddit.com${randomPost.permalink}`)
        .setImage(randomPost.url)
        .setFooter({ text: `👍 ${randomPost.ups} | r/${subreddit}` });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ 
        content: '❌ Failed to fetch meme. Try another subreddit!',
        ephemeral: true 
      });
    }
  }
};

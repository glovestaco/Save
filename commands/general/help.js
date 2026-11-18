const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Helper function for category emojis (defined within help.js as per plan)
function getCategoryEmoji(category) {
  const emojiMap = {
    moderation: '🛡️', // Using actual unicode emojis
    utility: '🛠️',
    fun: '🎉',
    music: '🎵',
    admin: '👑',
    welcome: '👋',
    economy: '💰',
    info: 'ℹ️' // Added emoji for the 'info' category
    // Add other categories from the project if they exist and have emojis
  };
  return emojiMap[category.toLowerCase()] || '📁'; // Default emoji
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help with all bot commands'),

  async execute(interaction, client) {
    // 1. Scan commands directory for categories
    const commandsPath = path.join(__dirname, '..');
    const categories = fs.readdirSync(commandsPath)
      .filter(folder => {
        const folderPath = path.join(commandsPath, folder);
        // Ensure it's a directory and not a file like '.DS_Store' or other hidden files
        return fs.statSync(folderPath).isDirectory();
      });

    // 2. Build command map
    const commandMap = new Map();

    for (const category of categories) {
      const categoryCommands = [];
      const commandFiles = fs.readdirSync(path.join(commandsPath, category))
        .filter(file => file.endsWith('.js'));

      for (const file of commandFiles) {
        try {
          const command = require(path.join(commandsPath, category, file));
          if (!command.data || !command.data.name || !command.data.description) {
            console.warn(`Command in ${category}/${file} is missing data, name, or description. Skipping.`);
            continue;
          }

          categoryCommands.push({
            name: command.data.name,
            description: command.data.description,
            options: command.data.options?.map(opt => ({
              name: opt.name,
              description: opt.description,
              required: opt.required
            })) || []
          });
        } catch (error) {
          console.error(`Failed to load command ${category}/${file}:`, error);
          continue; // Skip this command if it fails to load
        }
      }
      if (categoryCommands.length > 0) {
        commandMap.set(category, categoryCommands);
      }
    }

    if (commandMap.size === 0) {
        return interaction.reply({ content: 'No commands available to display.', ephemeral: true });
    }
    
    // 3. Create dropdown menu
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('dynamic_help')
      .setPlaceholder('Select a category')
      .addOptions(
        Array.from(commandMap.keys()).map(category => ({
          label: `${category.charAt(0).toUpperCase() + category.slice(1)}`,
          description: `${commandMap.get(category).length} commands available`,
          value: category,
          emoji: getCategoryEmoji(category)
        }))
      );

    // 4. Create buttons
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Github')
        .setStyle(ButtonStyle.Link)
        .setURL('https://github.com/Khanmanan/automod-bot') // User provided URL
        .setEmoji('<:Github:1132413518348566589>'), // User provided custom emoji
      new ButtonBuilder()
        .setLabel('Support Server')
        .setStyle(ButtonStyle.Link)
        .setURL('https://cwkbot.fun/discord') // User provided URL
        .setEmoji('<:abot:1367528015185313812>') // User provided custom emoji
    );
    
    // 5. Send initial response
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('📚 Command Help') // Emoji changed for clarity
          .setDescription('Select a category below to view its commands.') // Simplified description
          .setImage('https://cwkbot.fun/botb2.png') // User provided image
          .setFooter({ 
            text: `Total categories: ${commandMap.size} | Total commands: ${Array.from(commandMap.values()).flat().length}` 
          })
      ],
      components: [
        new ActionRowBuilder().addComponents(selectMenu),
        buttons
      ],
      ephemeral: true // Making help ephemeral is common practice
    });
  }
};

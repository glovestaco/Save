const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js'); // Add EmbedBuilder
const logger = require('../../utils/logger');
const { createEmbed } = require('../../utils/embeds'); // This seems to be an existing utility

// Helper function for category emojis (copied here for use by handleDynamicHelp)
function getCategoryEmoji(category) {
  const emojiMap = {
    moderation: '🛡️',
    utility: '🛠️',
    fun: '🎉',
    music: '🎵',
    admin: '👑',
    welcome: '👋',
    economy: '💰',
    info: 'ℹ️'
  };
  return emojiMap[category.toLowerCase()] || '📁';
}

// Helper function for URL validation
function isValidHttpUrl(string) {
  if (!string) return false; // Ensure string is not empty or null
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

async function handleDynamicHelp(interaction, client) {
  // User's original code for handleDynamicHelp, ensure 'client' is passed if needed by it,
  // though the provided snippet doesn't use 'client'.
  // The interaction object itself contains guild and other necessary details.
  const category = interaction.values[0];
  
  // Corrected path resolution assuming 'interactionCreate.js' is in 'events/client/'
  // and commands are in 'commands/' relative to project root.
  // __dirname would be 'events/client', so path.join(__dirname, '..', '..', 'commands', category)
  const commandsPath = path.join(__dirname, '..', '..', 'commands', category); 

  try {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    const commands = [];
    for (const file of commandFiles) {
      const commandFilePath = path.join(commandsPath, file);
      try {
        const command = require(commandFilePath);
        if (command.data && command.data.name && command.data.description) {
          commands.push({
            name: command.data.name,
            description: command.data.description,
            options: command.data.options?.map(opt => ({ name: opt.name, description: opt.description, required: opt.required })) || []
          });
        } else {
          logger.warn(`Command at ${commandFilePath} is missing data, name, or description. Skipping in help.`);
        }
      } catch (error) {
        logger.error(`Failed to require command at ${commandFilePath} for help display: ${error}`);
      }
    }

    if (commands.length === 0) {
      await interaction.update({ 
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000') // Red for warning/error
            .setTitle(`${getCategoryEmoji(category)} ${category.charAt(0).toUpperCase() + category.slice(1)} Commands`)
            .setDescription('No commands found in this category or commands failed to load.')
            .setFooter({ text: `Category: ${category}` })
        ],
        components: [] // Optional: remove components or keep original select menu
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`${getCategoryEmoji(category)} ${category.charAt(0).toUpperCase() + category.slice(1)} Commands`)
      .setDescription(
        commands.map(cmd => 
          `**/${cmd.name}**
` +
          `${cmd.description}
` +
          (cmd.options.length > 0 ? 
            `*Options:* ${cmd.options.map(opt => `\`${opt.name}\``).join(', ')}` : '')
        ).join('\n\n') // Ensure newline characters are correctly escaped for embed descriptions
      )
      .setFooter({ text: `${commands.length} commands in this category` });

    await interaction.update({ embeds: [embed], components: interaction.message.components }); // Keep original components
  } catch (error) {
    logger.error(`Error in handleDynamicHelp for category ${category}: ${error}`);
    await interaction.update({ 
      embeds: [
        new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Error')
          .setDescription('An error occurred while fetching commands for this category.')
      ],
      components: [] 
    });
  }
}

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        logger.error(`No command matching ${interaction.commandName} was found.`);
        // User might appreciate an ephemeral message here
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: `Command "${interaction.commandName}" not found.`, ephemeral: true });
        } else {
          await interaction.followUp({ content: `Command "${interaction.commandName}" not found.`, ephemeral: true });
        }
        return;
      }

      try {
        await command.execute(interaction, client);
        logger.info(`Executed command: ${interaction.commandName} by ${interaction.user.tag} in guild ${interaction.guildId}`);
      } catch (error) {
        logger.error(`Error executing ${interaction.commandName}: ${error.stack || error}`);

        const errorEmbed = createEmbed('error', { // Assuming createEmbed is a valid utility
          description: 'There was an error while executing this command!',
        });

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
        } else {
          await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
      }
    } else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'dynamic_help') {
        try {
          await handleDynamicHelp(interaction, client); // client might not be used by handleDynamicHelp based on snippet
          logger.info(`Handled dynamic_help select menu for category: ${interaction.values[0]} by ${interaction.user.tag} in guild ${interaction.guildId}`);
        } catch (error) {
          logger.error(`Error handling dynamic_help select menu: ${error.stack || error}`);
          // Generic error reply for select menu interaction itself
          if (!interaction.replied && !interaction.deferred) {
            // interaction.update() is used within handleDynamicHelp, so direct reply might conflict if it already updated.
            // However, if handleDynamicHelp throws *before* an update, this is a fallback.
            // For safety, check if interaction can be replied to or followed up.
            // It's generally better to handle errors within handleDynamicHelp and use interaction.update there.
            // The provided handleDynamicHelp includes its own error handling and interaction.update.
          }
        }
      }
      // Potentially other select menu handlers here
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId === 'embed_create_modal') {
        try {
          // Defer the reply to the modal submission. This is crucial.
          // The actual embed will be sent to the channel, and this interaction
          // will be acknowledged with an ephemeral message.
          await interaction.deferReply({ ephemeral: true });

          const title = interaction.fields.getTextInputValue('embed_title');
          const description = interaction.fields.getTextInputValue('embed_description');
          const authorName = interaction.fields.getTextInputValue('embed_author_name');
          const thumbnail_url = interaction.fields.getTextInputValue('embed_thumbnail_url');
          const footer_text = interaction.fields.getTextInputValue('embed_footer_text');
          // Color is not a field in the current modal definition due to the 5-input limit.

          const embed = new EmbedBuilder();

          if (title) embed.setTitle(title);
          if (description) embed.setDescription(description);
          
          // Author: Only name is collected from the modal.
          if (authorName) embed.setAuthor({ name: authorName });
          
          // Footer: Only text is collected from the modal.
          if (footer_text) embed.setFooter({ text: footer_text });

          let thumbnailSkippedMessage = '';
          if (thumbnail_url) {
            if (isValidHttpUrl(thumbnail_url)) {
              embed.setThumbnail(thumbnail_url);
            } else {
              // Log the warning, and set a message to inform the user.
              logger.warn(`Invalid thumbnail URL provided by ${interaction.user.tag} for embed: ${thumbnail_url}`);
              thumbnailSkippedMessage = ' Warning: The thumbnail URL provided was invalid and was skipped.';
            }
          }
          
          // Set a default color as it's not part of the modal's 5 fields.
          // Use client.config.embedColor if available, otherwise a hardcoded default.
          const defaultEmbedColor = client.config?.embedColor || '#0099FF';
          embed.setColor(defaultEmbedColor);


          // Send the created embed to the channel where the command was invoked.
          // This is a new message, not a reply to the interaction itself.
          await interaction.channel.send({ embeds: [embed] });
          
          // Edit the deferred reply to confirm success.
          await interaction.editReply({ 
            content: `Embed successfully created and sent!${thumbnailSkippedMessage}`, 
            ephemeral: true 
          });
          logger.info(`Embed created and sent by ${interaction.user.tag} in guild ${interaction.guildId}`);

        } catch (error) {
          logger.error(`Error handling embed_create_modal: ${error.stack || error}`);
          const errorMessage = 'There was an error processing your embed request.';
          if (interaction.deferred || interaction.replied) { // Check if already deferred or replied
            await interaction.editReply({ content: errorMessage, ephemeral: true }).catch(e => logger.error(`Failed to editReply in modal error handler: ${e}`));
          } else {
             // This case should ideally not be reached if we deferReply at the start.
            await interaction.reply({ content: errorMessage, ephemeral: true }).catch(e => logger.error(`Failed to reply in modal error handler: ${e}`));
          }
        }
      }
      //  else if (interaction.customId === 'another_modal_id') {
      //    // Handle other modals
      //  }
      else if (interaction.customId === 'bug_report_modal') { // New handler
        try {
          await interaction.deferReply({ ephemeral: true });
      
          const commandWithBug = interaction.fields.getTextInputValue('bug_report_command');
          const bugDescription = interaction.fields.getTextInputValue('bug_report_description');
          const stepsToReproduce = interaction.fields.getTextInputValue('bug_report_steps');
          const expectedBehavior = interaction.fields.getTextInputValue('bug_report_expected');
          const actualBehavior = interaction.fields.getTextInputValue('bug_report_actual');
      
          const reportChannelId = process.env.BUG_REPORT_CHANNEL_ID; 
      
          if (!reportChannelId) {
            logger.error('BUG_REPORT_CHANNEL_ID is not defined in environment variables.');
            await interaction.editReply({ content: 'Bug report submitted, but the report channel is not configured. Please contact the bot owner.', ephemeral: true });
            // Log the bug report to console as a fallback
            console.log(`--- Bug Report (Channel Not Configured) ---
User: ${interaction.user.tag} (${interaction.user.id})
Guild: ${interaction.guild?.name} (${interaction.guild?.id})
Command: ${commandWithBug || 'N/A'}
Description: ${bugDescription}
Steps: ${stepsToReproduce}
Expected: ${expectedBehavior || 'N/A'}
Actual: ${actualBehavior || 'N/A'}
-----------------------------------------`);
            return;
          }
      
          const reportEmbed = new EmbedBuilder()
            .setTitle('🐞 New Bug Report')
            .setColor(0xFF0000) // Red for bugs
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .addFields(
              { name: 'Reporter', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
              { name: 'Guild', value: interaction.guild ? `${interaction.guild.name} (${interaction.guild.id})` : 'Direct Message', inline: true },
              { name: 'Reported Command', value: commandWithBug || 'N/A', inline: false },
              { name: 'Description', value: bugDescription, inline: false },
              { name: 'Steps to Reproduce', value: stepsToReproduce, inline: false }
            )
            .setTimestamp();
      
          if (expectedBehavior) {
            reportEmbed.addFields({ name: 'Expected Behavior', value: expectedBehavior, inline: false });
          }
          if (actualBehavior) {
            reportEmbed.addFields({ name: 'Actual Behavior', value: actualBehavior, inline: false });
          }
      
          const reportChannel = await client.channels.fetch(reportChannelId).catch(() => null);
      
          if (reportChannel) {
            await reportChannel.send({ embeds: [reportEmbed] });
            await interaction.editReply({ content: 'Bug report successfully submitted! Thank you for your feedback.', ephemeral: true });
            logger.info(`Bug report submitted by ${interaction.user.tag} from guild ${interaction.guild?.id}`);
          } else {
            logger.error(`Could not find bug report channel with ID: ${reportChannelId}`);
            await interaction.editReply({ content: 'Your bug report was received, but I could not send it to the designated channel. Please notify the bot owner.', ephemeral: true });
            // Log the bug report to console as a fallback
            console.log(`--- Bug Report (Channel Not Found) ---
User: ${interaction.user.tag} (${interaction.user.id})
Guild: ${interaction.guild?.name} (${interaction.guild?.id})
Command: ${commandWithBug || 'N/A'}
Description: ${bugDescription}
Steps: ${stepsToReproduce}
Expected: ${expectedBehavior || 'N/A'}
Actual: ${actualBehavior || 'N/A'}
-----------------------------------------`);
          }
      
        } catch (error) {
          logger.error(`Error handling bug_report_modal: ${error.stack || error}`);
          // Fallback error reply if deferReply or editReply fails
          if (!interaction.replied && !interaction.deferred) { // Check if we can still reply
             await interaction.reply({ content: 'There was an error processing your bug report.', ephemeral: true }).catch(e => logger.error(`Failed to reply in bug_report_modal error handler: ${e}`));
          } else { // If already replied or deferred, try to followUp or edit the existing reply
             await interaction.editReply({ content: 'There was an error processing your bug report.', ephemeral: true }).catch(e => logger.error(`Failed to editReply in bug_report_modal error handler: ${e}`));
          }
        }
      }
    }
    // Add handlers for other interaction types like buttons if needed
  },
};

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Deletes a specified number of messages')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .addUserOption(option =>
      option.setName('target')
        .setDescription('Filter messages by this user'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction) {
    const { channel, options } = interaction;
    const amount = options.getInteger('amount');
    const target = options.getUser('target');

    await interaction.deferReply({ ephemeral: true });

    try {
      let messages;
      
      if (target) {
        // Fetch and filter messages by user
        messages = await channel.messages.fetch({ limit: 100 });
        messages = messages.filter(m => m.author.id === target.id);
        messages = Array.from(messages.values()).slice(0, amount);
      } else {
        // Fetch specified amount of messages
        messages = await channel.messages.fetch({ limit: amount });
      }

      // Bulk delete messages
      await channel.bulkDelete(messages, true);

      // Create embed
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setDescription(`✅ Successfully deleted ${messages.size} message(s)${target ? ` from ${target.tag}` : ''}.`)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Log the purge
      const logChannel = interaction.guild.channels.cache.get('YOUR_LOG_CHANNEL_ID');
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor('#ff9900')
          .setTitle('🗑️ Messages Purged')
          .addFields(
            { name: 'Channel', value: channel.toString() },
            { name: 'Amount', value: messages.size.toString() },
            { name: 'Moderator', value: interaction.user.tag },
            { name: 'Target', value: target ? target.tag : 'All messages' }
          )
          .setTimestamp();
        
        await logChannel.send({ embeds: [logEmbed] });
      }

    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: '❌ An error occurred while purging messages.', ephemeral: true });
    }
  },
};

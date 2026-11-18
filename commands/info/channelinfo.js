const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channelinfo')
    .setDescription('Get information about a server channel.')
    .addChannelOption(option =>
      option.setName('targetchannel')
        .setDescription('The channel to get information about. Defaults to the current channel.')
        .setRequired(false)),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
      return;
    }

    try {
      const targetChannel = interaction.options.getChannel('targetchannel') || interaction.channel;

      if (!targetChannel) {
        await interaction.reply({ content: '❌ Channel not found. Please make sure the channel exists or try again in the channel itself.', ephemeral: true });
        return;
      }
      
      const channelTypes = {
        [ChannelType.GuildText]: 'Text Channel',
        [ChannelType.GuildVoice]: 'Voice Channel',
        [ChannelType.GuildCategory]: 'Category',
        [ChannelType.GuildAnnouncement]: 'Announcement Channel',
        [ChannelType.GuildStageVoice]: 'Stage Voice Channel',
        [ChannelType.GuildForum]: 'Forum Channel',
        [ChannelType.GuildDirectory]: 'Directory Channel',
        [ChannelType.GuildPublicThread]: 'Public Thread',
        [ChannelType.GuildPrivateThread]: 'Private Thread',
      };

      const embed = new EmbedBuilder()
        .setColor('#3498db') // A nice blue color
        .setTitle(`Channel Info: #${targetChannel.name}`)
        .addFields(
          { name: '📜 Channel Name', value: targetChannel.name, inline: true },
          { name: '🆔 Channel ID', value: targetChannel.id, inline: true },
          { name: '🏷️ Type', value: channelTypes[targetChannel.type] || 'Unknown Channel Type', inline: true },
          { name: '📅 Created At', value: `<t:${parseInt(targetChannel.createdAt / 1000)}:R>`, inline: true },
          { name: '📊 Position', value: targetChannel.position.toString(), inline: true }
        )
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      if (targetChannel.parent) {
        embed.addFields({ name: '📁 Parent Category', value: targetChannel.parent.name, inline: true });
      }

      if (targetChannel.type === ChannelType.GuildText || targetChannel.type === ChannelType.GuildAnnouncement || targetChannel.type === ChannelType.GuildForum) {
        embed.addFields(
          { name: '📝 Topic', value: targetChannel.topic || 'None', inline: false },
          { name: '🔞 NSFW', value: targetChannel.nsfw ? 'Yes' : 'No', inline: true },
          { name: '⏳ Slowmode', value: targetChannel.rateLimitPerUser > 0 ? `${targetChannel.rateLimitPerUser}s` : 'Off', inline: true }
        );
      }

      if (targetChannel.type === ChannelType.GuildVoice || targetChannel.type === ChannelType.GuildStageVoice) {
        embed.addFields(
          { name: '🔊 Bitrate', value: `${targetChannel.bitrate / 1000} kbps`, inline: true },
          { name: '👥 User Limit', value: targetChannel.userLimit > 0 ? targetChannel.userLimit.toString() : 'Unlimited', inline: true }
        );
      }
      
      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error executing channelinfo command:', error);
      await interaction.reply({ 
        content: '❌ An error occurred while fetching channel information.',
        ephemeral: true 
      });
    }
  }
};

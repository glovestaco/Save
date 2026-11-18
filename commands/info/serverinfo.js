const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get information about the current server.'),
  
  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
      return;
    }

    try {
      const guild = interaction.guild;
      await guild.members.fetch(); // Ensure all members are cached for accurate counts

      const owner = await guild.fetchOwner();
      
      const humanMembers = guild.members.cache.filter(member => !member.user.bot).size;
      const botMembers = guild.members.cache.filter(member => member.user.bot).size;

      const textChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size;
      const voiceChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size;
      const categories = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory).size;

      const verificationLevels = {
        0: 'None',
        1: 'Low',
        2: 'Medium',
        3: 'High',
        4: 'Very High'
      };

      const tierLevels = {
        0: 'None',
        1: 'Tier 1',
        2: 'Tier 2',
        3: 'Tier 3'
      };

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Server Info: ${guild.name}`)
        .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: '🏷️ Server Name', value: guild.name, inline: true },
          { name: '🆔 Server ID', value: guild.id, inline: true },
          { name: '👑 Owner', value: owner ? owner.user.tag : 'N/A', inline: true },
          { name: '📅 Created At', value: `<t:${parseInt(guild.createdAt / 1000)}:R>`, inline: true },
          { name: `👥 Members (${guild.memberCount})`, value: `Humans: ${humanMembers}\nBots: ${botMembers}`, inline: true },
          { name: `📜 Channels (${textChannels + voiceChannels + categories})`, value: `Text: ${textChannels}\nVoice: ${voiceChannels}\nCategories: ${categories}`, inline: true },
          { name: '🎭 Role Count', value: guild.roles.cache.size.toString(), inline: true },
          { name: '🛡️ Verification Level', value: verificationLevels[guild.verificationLevel], inline: true },
          { name: '🚀 Boost Status', value: `${tierLevels[guild.premiumTier]} (${guild.premiumSubscriptionCount || 0} Boosts)`, inline: true }
        )
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      if (guild.banner) {
        embed.setImage(guild.bannerURL({ dynamic: true, size: 4096}));
      }
      
      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error executing serverinfo command:', error);
      await interaction.reply({ 
        content: '❌ An error occurred while fetching server information.',
        ephemeral: true 
      });
    }
  }
};

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a server member.')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to get information about.')
        .setRequired(false)),
  
  async execute(interaction) {
    try {
      const targetUser = interaction.options.getUser('target') || interaction.user;
      const member = await interaction.guild.members.fetch(targetUser.id);

      if (!member) {
        await interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
        return;
      }

      const roles = member.roles.cache.sort((a, b) => b.position - a.position).map(role => role.toString()).join(', ');
      const roleCount = member.roles.cache.size - 1; // Exclude @everyone role

      const embed = new EmbedBuilder()
        .setColor(member.displayHexColor === '#000000' ? '#95a5a6' : member.displayHexColor)
        .setTitle(`User Info: ${member.user.tag}`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: '👤 Username', value: member.user.tag, inline: true },
          { name: '🆔 User ID', value: member.user.id, inline: true },
          { name: '📅 Account Created', value: `<t:${parseInt(member.user.createdAt / 1000)}:R>`, inline: true },
          { name: '🗓️ Joined Server', value: `<t:${parseInt(member.joinedAt / 1000)}:R>`, inline: true },
          { name: `🎭 Roles (${roleCount})`, value: roles || 'None', inline: false },
          { name: '🌟 Status', value: member.presence?.status || 'Offline', inline: true }
        )
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      if (member.presence?.activities?.length > 0) {
        const activity = member.presence.activities[0];
        embed.addFields({ name: '🎮 Activity', value: `${activity.type} ${activity.name}`, inline: true });
      }

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        content: '❌ An error occurred while fetching user information.',
        ephemeral: true 
      });
    }
  }
};

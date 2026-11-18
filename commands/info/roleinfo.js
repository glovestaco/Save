const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Get information about a specific server role.')
    .addRoleOption(option =>
      option.setName('targetrole')
        .setDescription('The role to get information about.')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
      return;
    }

    try {
      const role = interaction.options.getRole('targetrole');

      if (!role) {
        await interaction.reply({ content: '❌ Role not found. Please make sure the role exists.', ephemeral: true });
        return;
      }
      
      // For key permissions, we can list some common ones or all of them.
      // Listing all can be very long, so let's pick a few or categorize.
      const permissions = role.permissions.toArray();
      let permsString = permissions.join(', ');
      if (permsString.length > 1024) { // Embed field value limit
        permsString = `${permsString.substring(0, 1020)}...`;
      }
      if (permissions.includes(PermissionsBitField.Flags.Administrator)) {
        permsString = 'Administrator (All Permissions)';
      }


      const embed = new EmbedBuilder()
        .setColor(role.hexColor === '#000000' ? '#95a5a6' : role.hexColor)
        .setTitle(`Role Info: ${role.name}`)
        .addFields(
          { name: '📜 Role Name', value: role.name, inline: true },
          { name: '🆔 Role ID', value: role.id, inline: true },
          { name: '🎨 Color', value: role.hexColor, inline: true },
          { name: '📅 Created At', value: `<t:${parseInt(role.createdAt / 1000)}:R>`, inline: true },
          { name: '🎢 Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
          { name: '🗣️ Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
          { name: '📊 Position', value: role.position.toString(), inline: true },
          { name: '👥 Member Count', value: role.members.size.toString(), inline: true },
          { name: '🔑 Permissions', value: permsString || 'None', inline: false }
        )
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error executing roleinfo command:', error);
      // Check for specific errors if needed, e.g. role deleted during command execution
      if (error.code === 10011) { // Unknown role
         await interaction.reply({ content: '❌ Role not found. It might have been deleted.', ephemeral: true });
      } else {
        await interaction.reply({ 
          content: '❌ An error occurred while fetching role information.',
          ephemeral: true 
        });
      }
    }
  }
};

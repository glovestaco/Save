const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const RoleAssignment = require('../../models/RoleAssignment');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Manages member roles')
    .addSubcommand(subcommand =>
      subcommand.setName('add')
        .setDescription('Adds a role to a member')
        .addUserOption(option =>
          option.setName('target')
            .setDescription('The member to add the role to')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('The role to add')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('reason')
            .setDescription('Reason for adding the role')))
    .addSubcommand(subcommand =>
      subcommand.setName('remove')
        .setDescription('Removes a role from a member')
        .addUserOption(option =>
          option.setName('target')
            .setDescription('The member to remove the role from')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('The role to remove')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('reason')
            .setDescription('Reason for removing the role')))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),

  async execute(interaction) {
    const { guild, options } = interaction;
    const subcommand = options.getSubcommand();
    const target = options.getMember('target');
    const role = options.getRole('role');
    const reason = options.getString('reason') || 'No reason provided';

    // Validation
    if (!target) return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
    if (!role.editable) return interaction.reply({ content: '❌ I cannot manage this role.', ephemeral: true });

    try {
      if (subcommand === 'add') {
        // Add role
        await target.roles.add(role, `Added by ${interaction.user.tag}: ${reason}`);

        // Save to database
        const assignment = new RoleAssignment({
          userId: target.id,
          guildId: guild.id,
          roleId: role.id,
          action: 'add',
          moderatorId: interaction.user.id,
          reason,
          timestamp: new Date()
        });
        await assignment.save();

        // Create embed
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Role Added')
          .setDescription(`Added ${role.name} to ${target.user.tag}`)
          .addFields(
            { name: 'Reason', value: reason },
            { name: 'Moderator', value: interaction.user.tag }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'remove') {
        // Remove role
        await target.roles.remove(role, `Removed by ${interaction.user.tag}: ${reason}`);

        // Save to database
        const assignment = new RoleAssignment({
          userId: target.id,
          guildId: guild.id,
          roleId: role.id,
          action: 'remove',
          moderatorId: interaction.user.id,
          reason,
          timestamp: new Date()
        });
        await assignment.save();

        // Create embed
        const embed = new EmbedBuilder()
          .setColor('#ff9900')
          .setTitle('❌ Role Removed')
          .setDescription(`Removed ${role.name} from ${target.user.tag}`)
          .addFields(
            { name: 'Reason', value: reason },
            { name: 'Moderator', value: interaction.user.tag }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      }

    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ An error occurred while managing roles.', ephemeral: true });
    }
  },
};

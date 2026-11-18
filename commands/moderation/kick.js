const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embeds');
const logger = require('../../utils/logger');
const Member = require('../../models/Member');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a member from the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for kicking'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    // Check if the target is kickable
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return interaction.reply({ 
        embeds: [createEmbed('error', { description: 'That user is not in this server!' })],
        ephemeral: true 
      });
    }

    if (!member.kickable) {
      return interaction.reply({ 
        embeds: [createEmbed('error', { description: 'I cannot kick that user!' })],
        ephemeral: true 
      });
    }

    try {
      // Save kick to database
      const kickRecord = new Member({
        userId: target.id,
        guildId: interaction.guild.id,
        action: 'kick',
        moderator: interaction.user.id,
        reason: reason,
        timestamp: new Date()
      });
      await kickRecord.save();

      // Kick the user
      await member.kick(reason);

      // Create embed
      const embed = createEmbed('success', {
        title: 'Member Kicked',
        description: `${target.tag} has been kicked from the server.`,
        fields: [
          { name: 'Reason', value: reason },
          { name: 'Moderator', value: interaction.user.tag }
        ]
      });

      await interaction.reply({ embeds: [embed] });
      logger.info(`Kicked ${target.tag} from ${interaction.guild.name}`);

    } catch (error) {
      logger.error(`Error kicking ${target.tag}: ${error}`);
      await interaction.reply({ 
        embeds: [createEmbed('error', { description: 'There was an error kicking that user!' })],
        ephemeral: true 
      });
    }
  },
};

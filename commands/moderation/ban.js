const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Ban = require('../../models/Ban');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a member from the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to ban')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Number of days of messages to delete (0-7)')
        .setMinValue(0)
        .setMaxValue(7))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const { guild, options } = interaction;
    const target = options.getUser('target');
    const days = options.getInteger('days') || 0;
    const reason = options.getString('reason') || 'No reason provided';

    try {
      // Check if user is already banned
      const bans = await guild.bans.fetch();
      if (bans.has(target.id)) {
        return interaction.reply({ content: '❌ This user is already banned.', ephemeral: true });
      }

      // Ban the user
      await guild.members.ban(target, { 
        deleteMessageDays: days,
        reason: `Banned by ${interaction.user.tag}: ${reason}`
      });

      // Save to database
      const banRecord = new Ban({
        userId: target.id,
        guildId: guild.id,
        moderatorId: interaction.user.id,
        reason,
        daysOfMessagesDeleted: days,
        timestamp: new Date()
      });
      await banRecord.save();

      // Create embed
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔨 Member Banned')
        .setDescription(`${target.tag} has been banned from the server.`)
        .addFields(
          { name: 'Reason', value: reason },
          { name: 'Moderator', value: interaction.user.tag },
          { name: 'Messages Deleted', value: `${days} day(s) of messages` }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      // DM the banned user
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle(`You were banned from ${guild.name}`)
          .addFields(
            { name: 'Reason', value: reason },
            { name: 'Moderator', value: interaction.user.tag }
          )
          .setFooter({ text: 'Contact server staff if you believe this was a mistake' })
          .setTimestamp();
        
        await target.send({ embeds: [dmEmbed] });
      } catch (dmError) {
        console.log(`Could not DM ${target.tag} about their ban`);
      }

    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ An error occurred while banning this user.', ephemeral: true });
    }
  },
};

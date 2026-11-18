const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Warn = require('../../models/Warn');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issues a warning to a member')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const { guild, options } = interaction;
    const target = options.getMember('target');
    const reason = options.getString('reason');

    // Validation
    if (!target) return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
    if (target.user.bot) return interaction.reply({ content: '❌ You cannot warn bots.', ephemeral: true });

    try {
      // Save warning to database
      const warn = new Warn({
        userId: target.id,
        guildId: guild.id,
        moderatorId: interaction.user.id,
        reason,
        timestamp: new Date()
      });
      await warn.save();

      // Get total warnings
      const warnings = await Warn.countDocuments({ 
        userId: target.id, 
        guildId: guild.id 
      });

      // Create embed
      const embed = new EmbedBuilder()
        .setColor('#ffcc00')
        .setTitle('⚠️ Member Warned')
        .setDescription(`${target.user.tag} has been warned.`)
        .addFields(
          { name: 'Reason', value: reason },
          { name: 'Moderator', value: interaction.user.tag },
          { name: 'Total Warnings', value: warnings.toString() }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      // DM the warned user
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor('#ffcc00')
          .setTitle(`You received a warning in ${guild.name}`)
          .addFields(
            { name: 'Reason', value: reason },
            { name: 'Moderator', value: interaction.user.tag },
            { name: 'Total Warnings', value: warnings.toString() }
          )
          .setFooter({ text: 'Continued violations may result in further action' })
          .setTimestamp();
        
        await target.send({ embeds: [dmEmbed] });
      } catch (dmError) {
        console.log(`Could not DM ${target.user.tag} about their warning`);
      }

    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ An error occurred while warning this user.', ephemeral: true });
    }
  },
};

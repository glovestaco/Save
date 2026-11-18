const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');
const Mute = require('../../models/Mute');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mutes a member with optional duration')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to mute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration of the mute (e.g. 1h, 30m)'))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the mute'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const { guild, options } = interaction;
    const target = options.getMember('target');
    const duration = options.getString('duration');
    const reason = options.getString('reason') || 'No reason provided';

    // Validation checks
    if (!target) return interaction.reply({ content: '❌ User not found in this server.', ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ content: '❌ You cannot mute yourself.', ephemeral: true });
    if (target.id === guild.client.user.id) return interaction.reply({ content: '❌ I cannot mute myself.', ephemeral: true });
    if (!target.moderatable) return interaction.reply({ content: '❌ I cannot mute this user.', ephemeral: true });

    try {
      let muteDuration = null;
      let muteExpires = null;

      if (duration) {
        muteDuration = ms(duration);
        if (isNaN(muteDuration) || muteDuration <= 0) {
          return interaction.reply({ content: '❌ Please provide a valid duration (e.g. 1h, 30m).', ephemeral: true });
        }
        muteExpires = new Date(Date.now() + muteDuration);
      }

      // Timeout the user (Discord's built-in timeout)
      await target.timeout(muteDuration, reason);

      // Save to database
      const muteRecord = new Mute({
        userId: target.id,
        guildId: guild.id,
        moderatorId: interaction.user.id,
        reason,
        duration: muteDuration ? duration : 'Permanent',
        expiresAt: muteExpires,
        active: true
      });
      await muteRecord.save();

      // Create embed
      const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('🔇 Member Muted')
        .setDescription(`${target.user.tag} has been muted${muteDuration ? ` for ${duration}` : ' permanently'}.`)
        .addFields(
          { name: 'Reason', value: reason },
          { name: 'Moderator', value: interaction.user.tag }
        )
        .setTimestamp();

      if (muteExpires) {
        embed.addFields({ name: 'Expires', value: `<t:${Math.floor(muteExpires.getTime() / 1000)}:R>` });
      }

      await interaction.reply({ embeds: [embed] });

      // Schedule unmute if duration was specified
      if (muteDuration) {
        setTimeout(async () => {
          if (target.isCommunicationDisabled()) {
            await target.timeout(null);
            muteRecord.active = false;
            await muteRecord.save();
            
            // Notify in log channel if configured
            const logChannel = guild.channels.cache.get('YOUR_LOG_CHANNEL_ID');
            if (logChannel) {
              const unmuteEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🔊 Member Automatically Unmuted')
                .setDescription(`${target.user.tag}'s mute has expired.`)
                .addFields(
                  { name: 'Original Reason', value: reason },
                  { name: 'Duration', value: duration }
                )
                .setTimestamp();
              await logChannel.send({ embeds: [unmuteEmbed] });
            }
          }
        }, muteDuration);
      }

    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ An error occurred while muting this user.', ephemeral: true });
    }
  },
};

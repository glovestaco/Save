const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const WelcomeConfig = require('../../models/WelcomeConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwelcome')
    .setDescription('Configure welcome settings')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Where welcome messages will be sent')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to assign to new members (optional)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('background')
        .setDescription('Custom background URL (optional)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const role = interaction.options.getRole('role');
    const background = interaction.options.getString('background');

    await WelcomeConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { 
        channelId: channel.id,
        roleId: role?.id,
        backgroundUrl: background || 'https://cwkbot.fun/welcome.png',
        enabled: true 
      },
      { upsert: true, new: true }
    );

    await interaction.reply({
      embeds: [{
        color: 0x2ECC71,
        title: '✅ Welcome System Configured',
        description: `New members will be greeted in ${channel}${role ? ` and receive ${role}` : ''}`,
        image: { url: background || 'https://cwkbot.fun/welcome.png' }
      }],
      ephemeral: true
    });
  }
};

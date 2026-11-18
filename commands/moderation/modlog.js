const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Pagination } = require('discordjs-button-embed-pagination');
const Warn = require('../../models/Warn');
const Ban = require('../../models/Ban');
const Mute = require('../../models/Mute');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('modlogs')
    .setDescription('View moderation history for a member')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to check')
        .setRequired(true)),

  async execute(interaction) {
    const target = options.getUser('target');
    const guildId = interaction.guild.id;

    await interaction.deferReply();

    try {
      // Fetch all moderation actions
      const [warnings, bans, mutes] = await Promise.all([
        Warn.find({ userId: target.id, guildId }).sort({ timestamp: -1 }),
        Ban.find({ userId: target.id, guildId }).sort({ timestamp: -1 }),
        Mute.find({ userId: target.id, guildId }).sort({ timestamp: -1 })
      ]);

      // Create embeds for each type
      const embeds = [];

      // Warnings embed
      if (warnings.length > 0) {
        const warnEmbed = new EmbedBuilder()
          .setColor('#ffcc00')
          .setTitle(`⚠️ Warnings for ${target.tag}`)
          .setDescription(`Total warnings: ${warnings.length}`);

        warnings.slice(0, 5).forEach((warn, i) => {
          warnEmbed.addFields({
            name: `Warning #${i + 1}`,
            value: `**Reason:** ${warn.reason}\n**Moderator:** <@${warn.moderatorId}>\n**Date:** <t:${Math.floor(warn.timestamp.getTime() / 1000)}:f>`,
            inline: false
          });
        });

        embeds.push(warnEmbed);
      }

      // Bans embed
      if (bans.length > 0) {
        const banEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle(`🔨 Bans for ${target.tag}`)
          .setDescription(`Total bans: ${bans.length}`);

        bans.slice(0, 5).forEach((ban, i) => {
          banEmbed.addFields({
            name: `Ban #${i + 1}`,
            value: `**Reason:** ${ban.reason}\n**Moderator:** <@${ban.moderatorId}>\n**Date:** <t:${Math.floor(ban.timestamp.getTime() / 1000)}:f>\n**Messages Deleted:** ${ban.daysOfMessagesDeleted} days`,
            inline: false
          });
        });

        embeds.push(banEmbed);
      }

      // Mutes embed
      if (mutes.length > 0) {
        const muteEmbed = new EmbedBuilder()
          .setColor('#ff9900')
          .setTitle(`🔇 Mutes for ${target.tag}`)
          .setDescription(`Total mutes: ${mutes.length}`);

        mutes.slice(0, 5).forEach((mute, i) => {
          muteEmbed.addFields({
            name: `Mute #${i + 1}`,
            value: `**Reason:** ${mute.reason}\n**Moderator:** <@${mute.moderatorId}>\n**Date:** <t:${Math.floor(mute.timestamp.getTime() / 1000)}:f>\n**Duration:** ${mute.duration}`,
            inline: false
          });
        });

        embeds.push(muteEmbed);
      }

      if (embeds.length === 0) {
        return interaction.editReply({ content: `No moderation records found for ${target.tag}.` });
      }

      // Add summary embed at the beginning
      const summaryEmbed = new EmbedBuilder()
        .setColor('#7289da')
        .setTitle(`📜 Moderation History for ${target.tag}`)
        .setDescription(`Total actions: ${warnings.length + bans.length + mutes.length}`)
        .addFields(
          { name: 'Warnings', value: warnings.length.toString(), inline: true },
          { name: 'Bans', value: bans.length.toString(), inline: true },
          { name: 'Mutes', value: mutes.length.toString(), inline: true }
        )
        .setThumbnail(target.displayAvatarURL());

      embeds.unshift(summaryEmbed);

      // Paginate if more than 1 embed
      if (embeds.length > 1) {
        const pagination = new Pagination(interaction, embeds);
        await pagination.paginate();
      } else {
        await interaction.editReply({ embeds });
      }

    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: '❌ An error occurred while fetching moderation logs.' });
    }
  },
};

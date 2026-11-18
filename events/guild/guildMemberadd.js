const { createWelcomeCard } = require('../../utils/welcomeImage');
const WelcomeConfig = require('../../models/WelcomeConfig');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const config = await WelcomeConfig.findOne({ guildId: member.guild.id });
    if (!config?.enabled) return;

    // Assign role if configured
    if (config.roleId) {
      try {
        await member.roles.add(config.roleId);
      } catch (error) {
        console.error(`Failed to assign role: ${error}`);
      }
    }

    // Send welcome message
    const channel = member.guild.channels.cache.get(config.channelId);
    if (!channel) return;

    try {
      const attachment = await createWelcomeCard(member);
      
      await channel.send({
        content: `🎉 Welcome ${member} to **${member.guild.name}**!`,
        files: [attachment],
        embeds: [{
          color: 0xFFA500,
          description: [
            `• Account created: <t:${Math.floor(member.user.createdTimestamp/1000)}:R>`,
            `• Read the rules in <#${member.guild.rulesChannelId}>`,
            `• Enjoy your stay!`
          ].join('\n')
        }]
      });
    } catch (error) {
      console.error(`Welcome error: ${error}`);
    }
  }
};

const { SlashCommandBuilder, EmbedBuilder, version: djsVersion } = require('discord.js');
const os = require('os'); // Required for system information like CPU, Memory

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Get information about me, the bot!'),
  
  async execute(interaction, client) {
    try {
      // Uptime calculation
      let totalSeconds = (client.uptime / 1000);
      let days = Math.floor(totalSeconds / 86400);
      totalSeconds %= 86400;
      let hours = Math.floor(totalSeconds / 3600);
      totalSeconds %= 3600;
      let minutes = Math.floor(totalSeconds / 60);
      let seconds = Math.floor(totalSeconds % 60);
      const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      // User Count
      const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

      // Developer/Owner - Replace with actual owner or project name if available
      const owner = 'Your Name/Project Name'; // Placeholder

      const embed = new EmbedBuilder()
        .setColor('#5865F2') // Discord blue
        .setTitle(`🤖 Bot Info: ${client.user.username}`)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: '📛 Bot Name', value: client.user.username, inline: true },
          { name: '🆔 Bot ID', value: client.user.id, inline: true },
          { name: '⚙️ Library', value: `Discord.js v${djsVersion}`, inline: true },
          { name: '⏱️ Uptime', value: uptime, inline: true },
          { name: '🌐 Servers', value: `${client.guilds.cache.size}`, inline: true },
          { name: '👥 Users', value: `${totalUsers}`, inline: true },
          { name: '💓 Ping', value: `${client.ws.ping}ms`, inline: true },
          { name: '👑 Developer', value: owner, inline: true }, // Update if owner info is fetched
          { name: '💻 Host CPU', value: `${os.cpus()[0].model}`, inline: false},
          { name: '💾 Host Memory', value: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB / ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB free`, inline: false }

        )
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error executing botinfo command:', error);
      await interaction.reply({ 
        content: '❌ An error occurred while fetching bot information.',
        ephemeral: true 
      });
    }
  }
};

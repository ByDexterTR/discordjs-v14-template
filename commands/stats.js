const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Shows bot statistics'),
  async execute(interaction) {
    const client = interaction.client;
    const uptime = process.uptime();
    const memory = process.memoryUsage().heapUsed / 1024 / 1024;
    const embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle(`${client.user.username} Stats`)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: 'Uptime', value: `<t:${Math.floor(Date.now() / 1000 - uptime)}:R>`, inline: true },
        { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Users', value: `${client.users.cache.size}`, inline: true },
        { name: 'Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
        { name: 'Memory', value: `${memory.toFixed(2)} MB`, inline: true },
        { name: 'Platform', value: `${os.platform()} ${os.arch()}`, inline: true }
      )
      .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};

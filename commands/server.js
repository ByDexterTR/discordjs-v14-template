const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Shows server information')
    .setDMPermission(false),
  execute: async (interaction) => {
    const guild = interaction.guild;

    const Embed = new EmbedBuilder()
      .setColor('Random')
      .setThumbnail(guild.iconURL({ dynamic: true, size: 4096 }))
      .setTitle(`${guild.name}'s Information`)
      .addFields(
        { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Created On', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '👤 Member', value: `${guild.memberCount} (${guild.members.cache.filter(member => member.user.bot).size} Bot)`, inline: true },
        { name: '💠 Role', value: `${guild.roles.cache.size - 1}`, inline: true },
        { name: '🧾 Channel', value: `${guild.channels.cache.size}`, inline: true },
        { name: '🌐 ID', value: `${guild.id}`, inline: true },
      )
      .setTimestamp()
      .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });
    await interaction.reply({ embeds: [Embed] });
  },
};
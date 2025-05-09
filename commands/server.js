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
        { name: '👤 Members', value: `${guild.memberCount} (${guild.members.cache.filter(member => member.user.bot).size} Bots)`, inline: true },
        { name: '💠 Roles', value: `${guild.roles.cache.size - 1}`, inline: true },
        { name: '🧾 Channels', value: `${guild.channels.cache.size}`, inline: true },
        { name: '🌐 ID', value: `${guild.id}`, inline: true },
        { name: '🚀 Boost Count', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
        { name: '🔒 Verification Level', value: `${guild.verificationLevel}`, inline: true },
        { name: '💤 AFK Channel', value: guild.afkChannel ? `<#${guild.afkChannel.id}>` : 'None', inline: true },
        { name: '⏱️ AFK Timeout', value: guild.afkTimeout ? `${guild.afkTimeout / 60} minutes` : 'None', inline: true },
        { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
        { name: '📋 Stickers', value: `${guild.stickers.cache.size}`, inline: true },
        { name: '🌍 Locale', value: `${guild.preferredLocale}`, inline: true },
      )
      .setImage(guild.bannerURL({ dynamic: true, size: 4096 }) || null)
      .setTimestamp()
      .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

    await interaction.reply({ embeds: [Embed] });
  },
};
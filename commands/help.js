const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all commands')
    .setDMPermission(false),
  execute: async (interaction) => {
    const Embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle(`${interaction.client.user.username}'s Commands`)
      .setDescription(
        '### 📁 General\n' +
        '- `/avatar` **Gets a user avatar**\n' +
        '- `/help` **Shows all commands**\n' +
        '- `/server` **Shows server information**\n' +
        '- `/steam` **Shows Steam user information**\n' +
        '### 💼 Admin\n' +
        '- `/clear` **Clears message to channel**\n' +
        '- `/embed` **Send Embed to the channel**\n'
      )
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });
    await interaction.reply({ embeds: [Embed] });
  },
};
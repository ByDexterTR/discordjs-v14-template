const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all commands')
    .setDMPermission(false),
  execute: async (interaction) => {
    const commandsList = interaction.client.commands.map(command => {
      return `- \`/${command.data.name}\` **${command.data.description}**`;
    }).join('\n');

    const Embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle(`${interaction.client.user.username}'s Commands`)
      .setDescription(commandsList)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

    await interaction.reply({ embeds: [Embed] });
  },
};
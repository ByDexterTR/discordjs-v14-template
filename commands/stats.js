const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { buildStatsEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Shows bot statistics'),
  async execute(interaction) {
    const refresh = new ButtonBuilder()
      .setCustomId('stats-refresh')
      .setLabel('Refresh')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🔄');
    const row = new ActionRowBuilder().addComponents(refresh);

    await interaction.reply({ embeds: [buildStatsEmbed(interaction)], components: [row] });
  },
};

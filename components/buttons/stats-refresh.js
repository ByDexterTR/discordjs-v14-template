const { buildStatsEmbed } = require('../../utils/embeds');

module.exports = {
  id: 'stats-refresh',
  async execute(interaction) {
    await interaction.update({ embeds: [buildStatsEmbed(interaction)] });
  },
};

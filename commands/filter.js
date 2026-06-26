const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { request } = require('../utils/http');
const { logError } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('filter')
    .setDescription('Apply a filter to a user\'s avatar')
    .addStringOption(option =>
      option
        .setName('filter')
        .setDescription('Choose a filter to apply')
        .setRequired(true)
        .addChoices(
          { name: 'Pixelate', value: 'pixelate' },
          { name: 'Blur', value: 'blur' },
          { name: 'Greyscale', value: 'greyscale' },
          { name: 'Invert', value: 'invert' },
          { name: 'Sepia', value: 'sepia' },
          { name: 'Comrade', value: 'comrade' },
          { name: 'Gay', value: 'gay' },
          { name: 'Glass', value: 'glass' },
          { name: 'Jail', value: 'jail' },
          { name: 'Passed', value: 'passed' },
          { name: 'Triggered', value: 'triggered' },
          { name: 'Wasted', value: 'wasted' }
        )
    )
    .addUserOption(option =>
      option.setName('user').setDescription('Select a user').setRequired(false)
    ),
  execute: async (interaction) => {
    const user = interaction.options.getUser('user') || interaction.user;
    const filter = interaction.options.getString('filter');
    const avatarURL = user.displayAvatarURL({ size: 4096, extension: 'png' });

    const isOverlayFilter = ['comrade', 'gay', 'glass', 'jail', 'passed', 'triggered', 'wasted'].includes(filter);
    const apiURL = isOverlayFilter
      ? `https://api.some-random-api.com/canvas/overlay/${filter}?avatar=${encodeURIComponent(avatarURL)}`
      : `https://api.some-random-api.com/canvas/filter/${filter}?avatar=${encodeURIComponent(avatarURL)}`;

    await interaction.deferReply();

    try {
      const response = await request(apiURL);
      const buffer = Buffer.from(await response.body.arrayBuffer());
      const fileName = `${filter}-${user.username.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
      const attachment = new AttachmentBuilder(buffer, { name: fileName });

      const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`${user.username}'s Avatar with ${filter.charAt(0).toUpperCase() + filter.slice(1)} Filter`)
        .setImage(`attachment://${fileName}`)
        .setTimestamp()
        .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

      await interaction.editReply({ embeds: [embed], files: [attachment] });
    } catch (error) {
      logError('filter', error);
      await interaction.editReply({ content: 'An error occurred while applying the filter. Please try again later.' });
    }
  },
};
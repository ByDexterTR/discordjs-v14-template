const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, InteractionContextType } = require('discord.js');
const { request } = require('../utils/http');
const { logError } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tweet')
    .setDescription('Generate a fake tweet')
    .setContexts(InteractionContextType.Guild)
    .addUserOption(option =>
      option.setName('user').setDescription('Select a user').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('comment').setDescription('Enter the tweet content').setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('theme')
        .setDescription('Choose a theme for the tweet')
        .setRequired(true)
        .addChoices(
          { name: 'Light', value: 'light' },
          { name: 'Dark', value: 'dark' }
        )
    ),
  execute: async (interaction) => {
    const user = interaction.options.getUser('user');
    const comment = interaction.options.getString('comment');
    const theme = interaction.options.getString('theme');
    const avatarURL = user.displayAvatarURL({ size: 4096, extension: 'png' });
    const displayName = interaction.guild.members.cache.get(user.id)?.displayName || user.username;
    const username = user.username;

    const apiURL = `https://api.some-random-api.com/canvas/misc/tweet?displayname=${encodeURIComponent(displayName)}&username=${encodeURIComponent(username)}&comment=${encodeURIComponent(comment)}&theme=${theme}&avatar=${encodeURIComponent(avatarURL)}`;

    await interaction.deferReply();

    try {
      const response = await request(apiURL);
      const buffer = Buffer.from(await response.body.arrayBuffer());
      const fileName = `tweet-${user.username.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
      const attachment = new AttachmentBuilder(buffer, { name: fileName });

      const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle('Fake Tweet')
        .setImage(`attachment://${fileName}`)
        .setTimestamp()
        .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

      await interaction.editReply({ embeds: [embed], files: [attachment] });
    } catch (error) {
      logError('tweet', error);
      await interaction.editReply({ content: 'An error occurred while generating the tweet. Please try again later.' });
    }
  },
};
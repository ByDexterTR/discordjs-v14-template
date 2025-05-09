const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Send Embed to the channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(option => option.setName('title').setDescription('Enter title').setRequired(true))
    .addStringOption(option => option.setName('description').setDescription('Enter description').setRequired(true))
    .addStringOption(option => option.setName('thumbnail').setDescription('Enter thumbnail URL'))
    .addStringOption(option => option.setName('image').setDescription('Enter image URL'))
    .addStringOption(option => option.setName('color').setDescription('Enter a hex color code (e.g., #ff0000)'))
    .addChannelOption(option => option.setName('channel').setDescription('Select a channel to send the embed'))
    .setDMPermission(false),
  execute: async (interaction) => {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const thumbnailOption = interaction.options.getString('thumbnail');
    const imageOption = interaction.options.getString('image');
    const colorOption = interaction.options.getString('color') || 'Random';
    const channelOption = interaction.options.getChannel('channel') || interaction.channel;

    if (thumbnailOption && !isValidUrl(thumbnailOption)) {
      return interaction.reply({ content: 'Invalid thumbnail URL.', ephemeral: true });
    }

    if (imageOption && !isValidUrl(imageOption)) {
      return interaction.reply({ content: 'Invalid image URL.', ephemeral: true });
    }

    if (colorOption && !/^#([0-9A-F]{3}){1,2}$/i.test(colorOption) && colorOption !== 'Random') {
      return interaction.reply({ content: 'Invalid color code. Please provide a valid hex color code (e.g., #ff0000).', ephemeral: true });
    }

    const Embed = new EmbedBuilder()
      .setColor(colorOption)
      .setTitle(title)
      .setDescription(description)
      .setThumbnail(thumbnailOption)
      .setImage(imageOption)
      .setTimestamp()
      .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

    await channelOption.send({ embeds: [Embed] });
    await interaction.reply({ content: `Embed has been sent to ${channelOption}.`, ephemeral: true });
  },
};

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (error) {
    return false;
  }
}
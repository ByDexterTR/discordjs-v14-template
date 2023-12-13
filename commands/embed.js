const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Send Embed to the channel')
    .addStringOption(option => option.setName('title').setDescription('Enter title'))
    .addStringOption(option => option.setName('description').setDescription('Enter description'))
    .addStringOption(option => option.setName('thumbnail').setDescription('Enter thumbnail url'))
    .addStringOption(option => option.setName('image').setDescription('Enter image url'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),
  execute: async (interaction) => {
    const thumbnailOption = interaction.options.getString('thumbnail');
    const imageOption = interaction.options.getString('image');
    if (thumbnailOption && !isValidUrl(thumbnailOption)) return await interaction.reply({ content: 'Invalid thumbnail URL.', ephemeral: true });
    if (imageOption && !isValidUrl(imageOption)) return await interaction.reply({ content: 'Invalid image URL.', ephemeral: true });
    
    const Embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle(interaction.options.getString('title'))
      .setDescription(interaction.options.getString('description'))
      .setThumbnail(interaction.options.getString('thumbnail'))
      .setImage(interaction.options.getString('image'))
      .setTimestamp()
      .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });
    await interaction.reply({ embeds: [Embed] });
  },
};

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (error) {
    return false;
  }
}
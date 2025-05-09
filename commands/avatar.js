const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Gets user avatar')
    .addUserOption(option =>
      option.setName('user').setDescription('User to get avatar').setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('format')
        .setDescription('Choose the avatar format')
        .addChoices(
          { name: 'PNG', value: 'png' },
          { name: 'JPG', value: 'jpg' },
          { name: 'WEBP', value: 'webp' },
          { name: 'GIF', value: 'gif' }
        )
    )
    .setDMPermission(false),
  execute: async (interaction) => {
    const target = interaction.options.getUser('user') || interaction.user;
    const format = interaction.options.getString('format') || 'png';

    const avatarURL = target.displayAvatarURL({ dynamic: true, size: 4096, extension: format });

    const Embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle(`${target.username}'s Avatar`)
      .setImage(avatarURL)
      .setTimestamp()
      .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

    const Button = new ButtonBuilder()
      .setLabel('Avatar Link')
      .setStyle(ButtonStyle.Link)
      .setURL(avatarURL);

    const row = new ActionRowBuilder().addComponents(Button);

    await interaction.reply({ embeds: [Embed], components: [row] });
  },
};
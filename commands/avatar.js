const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Gets user avatar')
    .addUserOption(option => option.setName('user').setDescription('User to get avatar').setRequired(true))
    .setDMPermission(false),
  execute: async (interaction) => {
    const target = interaction.options.getUser('user');
    if (!target) return await interaction.reply({ content: 'Invalid target.', ephemeral: true });

    const Embed = new EmbedBuilder()
      .setColor('Random')
      .setTitle(`${target.username}'s Avatar`)
      .setImage(target.displayAvatarURL({ dynamic: true, size: 4096, extension: "png" }))
      .setTimestamp()
      .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

    const Button = new ButtonBuilder()
      .setLabel('Avatar Link')
      .setStyle(ButtonStyle.Link)
      .setURL(target.displayAvatarURL({ dynamic: true, size: 4096, extension: "png" }));

    const row = new ActionRowBuilder().addComponents(Button);
    await interaction.reply({ embeds: [Embed], components: [row] });
  },
};
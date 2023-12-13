const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clears message to channel')
    .addIntegerOption(option => option.setName('amount').setDescription('Amount of messages to clear.').setRequired(true))
    .addUserOption(option => option.setName('user').setDescription('To clear user messages.').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),
  execute: async (interaction) => {
    const { channel, options } = interaction;

    let amount = options.getInteger('amount');
    if (amount >= 100) amount = 99;
    
    const target = options.getUser('user');

    const messages = await channel.messages.fetch({ limit: amount + 1 });
    if (target) {
      let i = 0;
      const filtered = [];

      await messages.filter((msg) => {
        if (msg.author.id === target.id && amount > i) {
          filtered.push(msg)
          i++;
        }
      })

      await channel.bulkDelete(filtered).then(messages => {
        const Embed = new EmbedBuilder()
          .setColor('Random')
          .setDescription(`### Successfully deleted ${messages.size} messages on ${target.username}`)
          .setTimestamp()
          .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });
        interaction.reply({ embeds: [Embed] });
      })
    } else {
      await channel.bulkDelete(amount, true).then(messages => {
        const Embed = new EmbedBuilder()
          .setColor('Random')
          .setDescription(`### Successfully deleted ${messages.size} messages on the channel`)
          .setTimestamp()
          .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });
        interaction.reply({ embeds: [Embed] });
      })
    }
  },
};
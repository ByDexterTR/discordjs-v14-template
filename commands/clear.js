const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags, InteractionContextType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clears message to channel')
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option => option.setName('amount').setDescription('Amount of messages to clear.').setRequired(true))
    .addUserOption(option => option.setName('user').setDescription('To clear user messages.').setRequired(false)),
  execute: async (interaction) => {
    const { channel, options } = interaction;

    let amount = options.getInteger('amount');
    if (amount < 1) {
      return interaction.reply({ content: 'Please provide an amount of at least 1.', flags: MessageFlags.Ephemeral });
    }
    if (amount > 100) amount = 100;

    const target = options.getUser('user');

    try {
      let deleted;
      if (target) {
        const messages = await channel.messages.fetch({ limit: 100 });
        const filtered = [];
        for (const msg of messages.values()) {
          if (msg.author.id === target.id && filtered.length < amount) {
            filtered.push(msg);
          }
        }
        deleted = await channel.bulkDelete(filtered, true);
      } else {
        deleted = await channel.bulkDelete(amount, true);
      }

      const Embed = new EmbedBuilder()
        .setColor('Random')
        .setDescription(target
          ? `### Successfully deleted ${deleted.size} messages on ${target.username}`
          : `### Successfully deleted ${deleted.size} messages on the channel`)
        .setTimestamp()
        .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

      return interaction.reply({ embeds: [Embed], flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error('Error clearing messages:', error);
      return interaction.reply({ content: 'An error occurred while clearing. Messages older than 14 days cannot be bulk deleted.', flags: MessageFlags.Ephemeral });
    }
  },
};
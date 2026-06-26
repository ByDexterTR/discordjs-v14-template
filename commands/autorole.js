const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags, InteractionContextType } = require('discord.js');
const db = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Manage autorole settings')
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addStringOption(option =>
      option
        .setName('action')
        .setDescription('Choose an action')
        .setRequired(true)
        .addChoices(
          { name: 'List', value: 'list' },
          { name: 'Add', value: 'add' },
          { name: 'Remove', value: 'remove' },
        )
    )
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('Select a role (required for Add/Remove)')
        .setRequired(false)
    ),
  execute: async (interaction) => {
    const action = interaction.options.getString('action');
    const role = interaction.options.getRole('role');
    const guildId = interaction.guild.id;

    const data = await db.read('autorole.json', {});

    if (!data[guildId]) {
      data[guildId] = [];
    }

    if (action === 'list') {
      const roles = data[guildId];
      if (roles.length === 0) {
        return interaction.reply({ content: 'No autoroles are set for this server.', flags: MessageFlags.Ephemeral });
      }

      const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle('Autoroles')
        .setDescription(roles.map(roleId => `<@&${roleId}>`).join('\n'))
        .setTimestamp();

      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    if (action === 'add') {
      if (!role) {
        return interaction.reply({ content: 'You must specify a role to add.', flags: MessageFlags.Ephemeral });
      }

      if (data[guildId].includes(role.id)) {
        return interaction.reply({ content: 'This role is already set as an autorole.', flags: MessageFlags.Ephemeral });
      }

      data[guildId].push(role.id);
      await db.write('autorole.json', data);

      return interaction.reply({ content: `The role <@&${role.id}> has been added to autoroles.`, flags: MessageFlags.Ephemeral });
    }

    if (action === 'remove') {
      if (!role) {
        return interaction.reply({ content: 'You must specify a role to remove.', flags: MessageFlags.Ephemeral });
      }

      if (!data[guildId].includes(role.id)) {
        return interaction.reply({ content: 'This role is not set as an autorole.', flags: MessageFlags.Ephemeral });
      }

      data[guildId] = data[guildId].filter(roleId => roleId !== role.id);
      await db.write('autorole.json', data);

      return interaction.reply({ content: `The role <@&${role.id}> has been removed from autoroles.`, flags: MessageFlags.Ephemeral });
    }
  },
};
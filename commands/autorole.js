const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '..', 'data', 'autorole.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('Manage autorole settings')
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

        let data;
        try {
            data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        } catch (error) {
            data = {};
        }

        if (!data[guildId]) {
            data[guildId] = [];
        }

        if (action === 'list') {
            const roles = data[guildId];
            if (roles.length === 0) {
                return interaction.reply({ content: 'No autoroles are set for this server.', flags: 64 });
            }

            const embed = new EmbedBuilder()
                .setColor('Random')
                .setTitle('Autoroles')
                .setDescription(roles.map(roleId => `<@&${roleId}>`).join('\n'))
                .setTimestamp();

            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        if (action === 'add') {
            if (!role) {
                return interaction.reply({ content: 'You must specify a role to add.', flags: 64 });
            }

            if (data[guildId].includes(role.id)) {
                return interaction.reply({ content: 'This role is already set as an autorole.', flags: 64 });
            }

            data[guildId].push(role.id);
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

            return interaction.reply({ content: `The role <@&${role.id}> has been added to autoroles.`, flags: 64 });
        }

        if (action === 'remove') {
            if (!role) {
                return interaction.reply({ content: 'You must specify a role to remove.', flags: 64 });
            }

            if (!data[guildId].includes(role.id)) {
                return interaction.reply({ content: 'This role is not set as an autorole.', flags: 64 });
            }

            data[guildId] = data[guildId].filter(roleId => roleId !== role.id);
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

            return interaction.reply({ content: `The role <@&${role.id}> has been removed from autoroles.`, flags: 64 });
        }
    },
};
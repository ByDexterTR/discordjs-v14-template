const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set the slowmode for a channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Select the channel to set slowmode')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('seconds')
                .setDescription('Set the slowmode duration in seconds (0 to 21600)')
                .setRequired(true)
        ),
    execute: async (interaction) => {
        const channel = interaction.options.getChannel('channel');
        const seconds = interaction.options.getInteger('seconds');

        if (!channel.isTextBased()) {
            return interaction.reply({ content: 'The selected channel must be a text-based channel.', flags: 64 });
        }

        if (seconds < 0 || seconds > 21600) {
            return interaction.reply({ content: 'The slowmode duration must be between 0 and 21600 seconds.', flags: 64 });
        }

        try {
            await channel.setRateLimitPerUser(seconds);
            if (seconds === 0) {
                return interaction.reply({ content: `Slowmode has been disabled for <#${channel.id}>.`, flags: 64 });
            } else {
                return interaction.reply({ content: `Slowmode for <#${channel.id}> has been set to ${seconds} seconds.`, flags: 64 });
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'An error occurred while setting the slowmode.', flags: 64 });
        }
    },
};
const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const superagent = require('superagent');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter')
        .setDescription('Apply a filter to a user\'s avatar')
        .addStringOption(option =>
            option
                .setName('filter')
                .setDescription('Choose a filter to apply')
                .setRequired(true)
                .addChoices(
                    { name: 'Pixelate', value: 'pixelate' },
                    { name: 'Blur', value: 'blur' },
                    { name: 'Greyscale', value: 'greyscale' },
                    { name: 'Invert', value: 'invert' },
                    { name: 'Sepia', value: 'sepia' },
                    { name: 'Comrade', value: 'comrade' },
                    { name: 'Gay', value: 'gay' },
                    { name: 'Glass', value: 'glass' },
                    { name: 'Jail', value: 'jail' },
                    { name: 'Passed', value: 'passed' },
                    { name: 'Triggered', value: 'triggered' },
                    { name: 'Wasted', value: 'wasted' }
                )
        )
        .addUserOption(option =>
            option.setName('user').setDescription('Select a user').setRequired(false)
        ),
    execute: async (interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;
        const filter = interaction.options.getString('filter');
        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 4096, extension: 'png' });

        const isOverlayFilter = ['comrade', 'gay', 'glass', 'jail', 'passed', 'triggered', 'wasted'].includes(filter);
        const apiURL = isOverlayFilter
            ? `https://api.some-random-api.com/canvas/overlay/${filter}?avatar=${encodeURIComponent(avatarURL)}`
            : `https://api.some-random-api.com/canvas/filter/${filter}?avatar=${encodeURIComponent(avatarURL)}`;

        try {
            const response = await superagent.get(apiURL).responseType('blob');
            const buffer = response.body;
            const attachment = new AttachmentBuilder(buffer, { name: `${filter}-${user.username}.png` });

            const embed = new EmbedBuilder()
                .setColor('Random')
                .setTitle(`${user.username}'s Avatar with ${filter.charAt(0).toUpperCase() + filter.slice(1)} Filter`)
                .setImage(`attachment://${filter}-${user.username}.png`)
                .setTimestamp()
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed], files: [attachment] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while applying the filter. Please try again later.', ephemeral: true });
        }
    },
};
const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const superagent = require('superagent');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tweet')
        .setDescription('Generate a fake tweet')
        .addUserOption(option =>
            option.setName('user').setDescription('Select a user').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('comment').setDescription('Enter the tweet content').setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('theme')
                .setDescription('Choose a theme for the tweet')
                .setRequired(true)
                .addChoices(
                    { name: 'Light', value: 'light' },
                    { name: 'Dark', value: 'dark' }
                )
        ),
    execute: async (interaction) => {
        const user = interaction.options.getUser('user');
        const comment = interaction.options.getString('comment');
        const theme = interaction.options.getString('theme');
        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 4096, extension: 'png' });
        const displayName = interaction.guild.members.cache.get(user.id)?.displayName || user.username;
        const username = user.username;

        const apiURL = `https://api.some-random-api.com/canvas/misc/tweet?displayname=${encodeURIComponent(displayName)}&username=${encodeURIComponent(username)}&comment=${encodeURIComponent(comment)}&theme=${theme}&avatar=${encodeURIComponent(avatarURL)}`;

        try {
            const response = await superagent.get(apiURL).responseType('blob');
            const buffer = response.body;
            const attachment = new AttachmentBuilder(buffer, { name: `tweet-${user.username}.png` });

            const embed = new EmbedBuilder()
                .setColor('Random')
                .setTitle('Fake Tweet')
                .setImage(`attachment://tweet-${user.username}.png`)
                .setTimestamp()
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed], files: [attachment] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while generating the tweet. Please try again later.', ephemeral: true });
        }
    },
};
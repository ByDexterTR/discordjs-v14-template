const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { request } = require('../utils/http');
const { logError } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('animal')
    .setDescription('Get a random animal image and fact')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Choose an animal type')
        .setRequired(true)
        .addChoices(
          { name: 'Fox', value: 'fox' },
          { name: 'Cat', value: 'cat' },
          { name: 'Birb', value: 'birb' },
          { name: 'Panda', value: 'panda' },
          { name: 'Red Panda', value: 'red_panda' },
          { name: 'Racoon', value: 'racoon' },
          { name: 'Koala', value: 'koala' },
          { name: 'Kangaroo', value: 'kangaroo' },
          { name: 'Whale', value: 'whale' },
          { name: 'Dog', value: 'dog' },
          { name: 'Bird', value: 'bird' },
        )
    ),
  execute: async (interaction) => {
    const selectedAnimal = interaction.options.getString('type');

    await interaction.deferReply();

    try {
      const response = await request(`https://api.some-random-api.com/animal/${selectedAnimal}`);
      const body = await response.body.json();
      const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`Here's a ${selectedAnimal.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}!`)
        .setDescription(body.fact)
        .setImage(body.image)
        .setTimestamp()
        .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      logError('animal', error);
      await interaction.editReply({ content: 'An error occurred while fetching the animal data.' });
    }
  },
};
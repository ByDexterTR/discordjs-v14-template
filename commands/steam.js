const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const { steam_apikey } = require('./../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('steam')
    .setDescription('Shows Steam user information')
    .addStringOption(option => option.setName('url').setDescription('Enter a steam vanity url'))
    .addStringOption(option => option.setName('id').setDescription('Enter a steam id'))
    .setDMPermission(false),
  execute: async (interaction) => {
    const vanityurl = interaction.options.getString('url');
    const id = interaction.options.getString('id');
    if (!vanityurl && !id) return await interaction.reply({ content: 'Invalid steam vanity url or steam id.', ephemeral: true });
    if (id && isNaN(id)) return await interaction.reply({ content: 'Invalid steam id.', ephemeral: true });
    try {
      let steamId;

      if (vanityurl) {
        const response = await axios.get(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${steam_apikey}&vanityurl=${vanityurl}`);
        steamId = response.data.response.steamid;
        if (steamId === undefined) return await interaction.reply({ content: 'Invalid steam vanity url.', ephemeral: true });
      } else steamId = id;

      const steam = await axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steam_apikey}&steamids=${steamId}`);
      const player = steam.data.response.players[0];

      if (!player || player.steamid === undefined) return await interaction.reply({ content: 'Invalid steam id.', ephemeral: true });

      const created = player.timecreated === undefined ? 'Private' : `<t:${player.timecreated}:R>`;
      const last = player.lastlogoff === undefined ? 'Private' : `<t:${player.lastlogoff}:R>`;

      let comments;
      if (player.commentpermission === 1) comments = 'All';
      else if (player.commentpermission === 2) comments = 'Private';
      else comments = 'Friend';

      const Embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`:flag_${player.loccountrycode === undefined ? 'black' : player.loccountrycode.toLowerCase()}: ${player.personaname}'s Information`)
        .setThumbnail(player.avatarfull)
        .addFields(
          { name: '👤 Name', value: `${player.personaname === undefined ? 'unnamed' : player.personaname}`, inline: true },
          { name: '📅 Created On', value: `${created}`, inline: true },
          { name: '🌐 ID', value: `${steamId}`, inline: true },
          { name: '💬 Comments', value: `${comments}`, inline: true },
          { name: '⏱️ Last Login', value: `${last}`, inline: true },
          { name: '🕹 Game', value: `${player.gameextrainfo === undefined ? 'Idle' : player.gameextrainfo}`, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

      const Button = new ButtonBuilder()
        .setLabel('Profile Link')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://steamcommunity.com/profiles/${steamId}`);

      const row = new ActionRowBuilder().addComponents(Button);
      await interaction.reply({ embeds: [Embed], components: [row] });
    } catch (error) {
      console.error('ERROR:', error.response ? error.response.data : error.message);
      if (error.response.data === '<html><head><title>Forbidden</title></head><body><h1>Forbidden</h1>Access is denied. Retrying will not help. Please verify your <pre>key=</pre> parameter.</body></html>') return await interaction.reply({ content: 'Invalid Steam Api Key.', ephemeral: true });
      return await interaction.reply({ content: 'Invalid steam id.', ephemeral: true });
    }
  },
};
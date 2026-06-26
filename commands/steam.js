const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { request } = require('../utils/http');
const { logError } = require('../utils/logger');
const { steamApiKey: APIKEY } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('steam')
    .setDescription('Shows Steam user information')
    .addStringOption(option => option.setName('url').setDescription('Enter a Steam vanity URL or username'))
    .addStringOption(option => option.setName('id').setDescription('Enter a Steam64 ID')),
  execute: async (interaction) => {
    if (!APIKEY) {
      return await interaction.reply({ content: 'Steam API Key is not configured. Please contact the administrator.', flags: MessageFlags.Ephemeral });
    }

    const vanityurl = interaction.options.getString('url');
    const id = interaction.options.getString('id');

    if (!vanityurl && !id) {
      return await interaction.reply({
        content: 'Please provide either a Steam vanity URL, username, or a Steam64 ID. Example: `/steam url:ByDexterTR` or `/steam id:76561198000000000`.',
        flags: MessageFlags.Ephemeral,
      });
    }

    if (id && !/^\d{17}$/.test(id)) {
      return await interaction.reply({ content: 'Invalid Steam64 ID. Please provide a valid 17-digit Steam64 ID.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();

    try {
      let steamId = id;

      if (vanityurl) {
        const matchVanity = vanityurl.match(/https:\/\/steamcommunity\.com\/(?:id|profiles)\/([^/]+)/);
        const identifier = matchVanity ? matchVanity[1] : vanityurl;

        const resolveUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${APIKEY}&vanityurl=${encodeURIComponent(identifier)}`;
        const response = await request(resolveUrl);
        const resolved = await response.body.json();
        steamId = resolved.response.steamid;

        if (!steamId) {
          return await interaction.editReply({ content: 'Invalid Steam vanity URL or username.' });
        }
      }

      const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${APIKEY}&steamids=${steamId}`;
      const steam = await request(url);
      const steamJson = await steam.body.json();
      const player = steamJson.response.players[0];

      if (!player) {
        return await interaction.editReply({ content: 'No player found for the provided Steam ID.' });
      }

      const created = player.timecreated ? `<t:${player.timecreated}:R>` : 'Private';
      const comments = player.commentpermission === 1 ? 'All' : player.commentpermission === 2 ? 'Private' : 'Friend';

      const status = {
        0: 'Offline',
        1: 'Online',
        2: 'Busy',
        3: 'Away',
        4: 'Snooze',
        5: 'Looking to Trade',
        6: 'Looking to Play',
      }[player.personastate] || 'Unknown';

      const country = player.loccountrycode ? `:flag_${player.loccountrycode.toLowerCase()}: ${player.loccountrycode}` : 'Unknown';
      const game = player.gameextrainfo ? player.gameextrainfo : 'Not playing';

      const Embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`${player.personaname}'s Information`)
        .setThumbnail(player.avatarfull)
        .addFields(
          { name: '👤 Name', value: player.personaname || 'Unnamed', inline: true },
          { name: '📅 Created On', value: created, inline: true },
          { name: '🌐 ID', value: steamId, inline: true },
          { name: '💬 Comments', value: comments, inline: true },
          { name: '📡 Status', value: status, inline: true },
          { name: '🌍 Country', value: country, inline: true },
          { name: '🎮 Currently Playing', value: game, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() });

      const Button = new ButtonBuilder()
        .setLabel('Profile Link')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://steamcommunity.com/profiles/${steamId}`);

      const row = new ActionRowBuilder().addComponents(Button);
      await interaction.editReply({ embeds: [Embed], components: [row] });
    } catch (error) {
      logError('steam', error);
      await interaction.editReply({ content: 'An error occurred while fetching Steam data. Please try again later.' });
    }
  },
};
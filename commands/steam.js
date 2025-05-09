const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const superagent = require('superagent');
const { steam_apikey } = require('./../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('steam')
    .setDescription('Shows Steam user information')
    .addStringOption(option => option.setName('url').setDescription('Enter a Steam vanity URL or username'))
    .addStringOption(option => option.setName('id').setDescription('Enter a Steam64 ID'))
    .setDMPermission(false),
  execute: async (interaction) => {
    if (!steam_apikey) {
      return await interaction.reply({ content: 'Steam API Key is not configured. Please contact the administrator.', ephemeral: true });
    }

    const vanityurl = interaction.options.getString('url');
    const id = interaction.options.getString('id');
    let steamId;

    if (!vanityurl && !id) {
      return await interaction.reply({
        content: 'Please provide either a Steam vanity URL, username, or a Steam64 ID. Example: `/steam url:ByDexterTR` or `/steam id:76561198000000000`.',
        ephemeral: true,
      });
    }

    if (vanityurl) {
      const matchVanity = vanityurl.match(/https:\/\/steamcommunity\.com\/(?:id|profiles)\/([^/]+)/);
      const identifier = matchVanity ? matchVanity[1] : vanityurl;

      const response = await superagent.get(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/`)
        .query({ key: steam_apikey, vanityurl: identifier });
      steamId = response.body.response.steamid;

      if (!steamId) {
        return await interaction.reply({ content: 'Invalid Steam vanity URL or username.', ephemeral: true });
      }
    } else if (id) {
      const matchId = id.match(/^\d{17}$/);
      if (matchId) {
        steamId = id;
      } else {
        return await interaction.reply({ content: 'Invalid Steam64 ID. Please provide a valid 17-digit Steam64 ID.', ephemeral: true });
      }
    }

    try {
      const steam = await superagent.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/`)
        .query({ key: steam_apikey, steamids: steamId });
      const player = steam.body.response.players[0];

      if (!player) {
        return await interaction.reply({ content: 'No player found for the provided Steam ID.', ephemeral: true });
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
      await interaction.reply({ embeds: [Embed], components: [row] });
    } catch (error) {
      console.error('ERROR:', error.response ? error.response.text : error.message);
      await interaction.reply({ content: 'An error occurred while fetching Steam data. Please try again later.', ephemeral: true });
    }
  },
};
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const path = require('path');
const config = require(path.join(__dirname, '..', 'data', 'tft.json'));

const RIOT_APIKEY = config.APIKEY;
const regionEndpoints = config.validRegions;
const routingEndpoints = config.routing;
const rankColors = config.embedRankColors;

function getRegionKey(input) {
  input = input.toLowerCase();
  if (regionEndpoints.includes(input)) return input;
  const map = {
    euw: 'euw1', eun: 'eun1', na: 'na1', tr: 'tr1', ru: 'ru', kr: 'kr', jp: 'jp1',
    br: 'br1', lan: 'la1', las: 'la2', oce: 'oc1', me: 'me1', sg: 'sg2', tw: 'tw2', vn: 'vn2'
  };
  return map[input] || null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tft')
    .setDescription('Shows Teamfight Tactics rank information')
    .addStringOption(opt => opt.setName('name').setDescription('Enter the summoner name').setRequired(true))
    .addStringOption(opt => opt.setName('tag').setDescription('Enter the summoner tag').setRequired(true))
    .addStringOption(opt =>
      opt.setName('region')
        .setDescription('Region')
        .setRequired(true)
        .addChoices(
          { name: 'EUW', value: 'euw1' },
          { name: 'EUNE', value: 'eun1' },
          { name: 'NA', value: 'na1' },
          { name: 'TR', value: 'tr1' },
          { name: 'RU', value: 'ru' },
          { name: 'KR', value: 'kr' },
          { name: 'JP', value: 'jp1' },
          { name: 'BR', value: 'br1' },
          { name: 'LAN', value: 'la1' },
          { name: 'LAS', value: 'la2' },
          { name: 'OCE', value: 'oc1' },
          { name: 'ME', value: 'me1' },
          { name: 'SG', value: 'sg2' },
          { name: 'TW', value: 'tw2' },
          { name: 'VN', value: 'vn2' }
        )
    ),
  execute: async (interaction) => {
    if (!RIOT_APIKEY) {
      return interaction.reply({ content: 'Riot API key is not configured. Please contact the administrator.', flags: 64 });
    }

    const gameName = interaction.options.getString('name');
    const tagLine = interaction.options.getString('tag');
    const regionInput = interaction.options.getString('region');
    const region = getRegionKey(regionInput);
    const routing = routingEndpoints[region];

    if (!region || !routing) {
      return interaction.reply({ content: 'Invalid region.', flags: 64 });
    }

    try {
      const accRes = await request(`https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}?api_key=${RIOT_APIKEY}`);
      if (accRes.statusCode !== 200) {
        return interaction.reply({ content: 'Player not found.', flags: 64 });
      }
      const accData = await accRes.body.json();

      const summRes = await request(`https://${region}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${accData.puuid}?api_key=${RIOT_APIKEY}`);
      if (summRes.statusCode !== 200) {
        return interaction.reply({ content: 'Could not fetch summoner information.', flags: 64 });
      }
      const summData = await summRes.body.json();

      const leagueRes = await request(`https://${region}.api.riotgames.com/tft/league/v1/by-puuid/${accData.puuid}?api_key=${RIOT_APIKEY}`);
      if (leagueRes.statusCode !== 200) {
        return interaction.reply({ content: 'Could not fetch rank information.', flags: 64 });
      }
      const leagueData = await leagueRes.body.json();

      let ranked = leagueData.find(q => q.queueType === 'RANKED_TFT');

      const embed = new EmbedBuilder()
        .setColor(rankColors[(ranked ? ranked.tier.toUpperCase() : '')] || '#63666b')
        .setAuthor({ name: `${accData.gameName}#${accData.tagLine} (${summData.summonerLevel} Lv.)`, iconURL: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${summData.profileIconId}.jpg` })
        .addFields(
          { name: 'Ranked', value: ranked ? `${config[`${ranked.tier} ${ranked.rank}`]} (${ranked.leaguePoints} LP)` : 'Unranked', inline: true },
        )
        .setFooter({ text: 'Teamfight Tactics', iconURL: 'https://s-gigs.op.gg/images/a/c/acd526164267078ade35ac47844d7d1b.webp' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'An error occurred or the player could not be found.', flags: 64 });
    }
  }
};

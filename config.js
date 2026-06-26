require('dotenv').config();

module.exports = {
  // Required
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,

  // Optional
  guildId: process.env.GUILD_ID || '', // Empty = global.
  ownerId: process.env.OWNER_ID || '', // Bot owner user ID (for /reload).

  // API keys
  riotApiKey: process.env.RIOT_API_KEY || '', // /lol and /tft
  steamApiKey: process.env.STEAM_API_KEY || '', // /steam
};

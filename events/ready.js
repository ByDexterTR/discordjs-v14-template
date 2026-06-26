const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(
      `---------------------------------------------\n` +
      `Name: ${client.user.username}\n` +
      `Users: ${client.users.cache.size}\n` +
      `Servers: ${client.guilds.cache.size}\n` +
      `Bot started!`,
    );
  },
};

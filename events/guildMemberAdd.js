const { Events } = require('discord.js');
const db = require('../utils/database');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      const data = await db.read('autorole.json', {});
      const roles = data[member.guild.id];
      if (!roles || roles.length === 0) return;

      for (const roleId of roles) {
        const role = member.guild.roles.cache.get(roleId);
        if (role) {
          await member.roles.add(role).catch(console.error);
        }
      }
    } catch (error) {
      console.error('Failed to assign autoroles:', error.message);
    }
  },
};

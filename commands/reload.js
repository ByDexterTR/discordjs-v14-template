const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');
const config = require(path.join(__dirname, '..', 'config.json'));

function isOwner(userId) {
  return config.owner_id && config.owner_id === userId;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads all commands (Bot owner only)'),
  async execute(interaction) {
    if (!config.owner_id) {
      return interaction.reply({ content: 'Bot owner is not configured. Please set owner_id in config.json.', flags: 64 });
    }
    if (!isOwner(interaction.user.id)) {
      return interaction.reply({ content: 'You are not authorized to use this command.', flags: 64 });
    }

    const commandsDir = path.join(__dirname);
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js') && file !== 'reload.js');
    let reloaded = [];
    let failed = [];

    for (const file of commandFiles) {
      const commandPath = path.join(commandsDir, file);
      try {
        delete require.cache[require.resolve(commandPath)];
        const newCommand = require(commandPath);
        interaction.client.commands.set(newCommand.data.name, newCommand);
        reloaded.push(newCommand.data.name);
      } catch (error) {
        console.error(`Failed to reload command ${file}:`, error);
        failed.push(file);
      }
    }

    let reply = `Reloaded commands: ${reloaded.join(', ') || 'None'}`;
    if (failed.length) reply += `\nFailed: ${failed.join(', ')}`;
    return interaction.reply({ content: reply, flags: 64 });
  }
};
const { SlashCommandBuilder, MessageFlags, REST, Routes } = require('discord.js');
const path = require('path');
const fs = require('fs');
const config = require('../config');

function isOwner(userId) {
  return config.ownerId && config.ownerId === userId;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads all commands (Bot owner only)'),
  async execute(interaction) {
    if (!config.ownerId) {
      return interaction.reply({ content: 'Bot owner is not configured. Please set OWNER_ID in your .env file.', flags: MessageFlags.Ephemeral });
    }
    if (!isOwner(interaction.user.id)) {
      return interaction.reply({ content: 'You are not authorized to use this command.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const commandsDir = path.join(__dirname);
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js') && file !== 'reload.js');
    const reloaded = [];
    const failed = [];

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

    let deployStatus;
    try {
      const body = interaction.client.commands.map(command => command.data.toJSON());
      const rest = new REST({ version: '10' }).setToken(config.token);
      if (config.guildId) {
        await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body });
        deployStatus = 'Re-deployed commands to the guild.';
      } else {
        await rest.put(Routes.applicationCommands(config.clientId), { body });
        deployStatus = 'Re-deployed global commands.';
      }
    } catch (error) {
      console.error('Failed to re-deploy commands:', error);
      deployStatus = '⚠️ Reloaded in memory, but failed to re-deploy to Discord.';
    }

    let reply = `Reloaded commands: ${reloaded.join(', ') || 'None'}`;
    if (failed.length) reply += `\nFailed: ${failed.join(', ')}`;
    reply += `\n${deployStatus}`;
    return interaction.editReply({ content: reply });
  }
};
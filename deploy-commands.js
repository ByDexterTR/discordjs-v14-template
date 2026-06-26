const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const config = require('./config');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const files = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of files) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`[deploy] Skipping invalid command file: ${file}`);
  }
}

(async () => {
  if (!config.token || !config.clientId) {
    console.error('[deploy] TOKEN and CLIENT_ID must be set in your .env file.');
    process.exitCode = 1;
    return;
  }

  const rest = new REST({ version: '10' }).setToken(config.token);

  try {
    console.log(`[deploy] Deploying ${commands.length} commands...`);
    if (config.guildId) {
      await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });
      console.log(`[deploy] Successfully deployed ${commands.length} guild commands to ${config.guildId}.`);
    } else {
      await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
      console.log(`[deploy] Successfully deployed ${commands.length} global commands.`);
    }
  } catch (error) {
    console.error('[deploy] Failed to deploy commands:', error);
    process.exitCode = 1;
  }
})();

const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const files = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  for (const file of files) {
    try {
      const command = require(path.join(commandsPath, file));
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
      } else {
        console.warn(`[commands] Skipping invalid file (missing data/execute): ${file}`);
      }
    } catch (error) {
      console.error(`[commands] Failed to load ${file}:`, error);
    }
  }

  console.log(`[commands] Loaded ${client.commands.size} commands.`);
};

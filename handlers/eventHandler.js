const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const eventsPath = path.join(__dirname, '..', 'events');
  const files = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

  for (const file of files) {
    try {
      const event = require(path.join(eventsPath, file));
      if (!event.name || !event.execute) {
        console.warn(`[events] Skipping invalid file (missing name/execute): ${file}`);
        continue;
      }
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
    } catch (error) {
      console.error(`[events] Failed to load ${file}:`, error);
    }
  }

  console.log(`[events] Loaded ${files.length} events.`);
};

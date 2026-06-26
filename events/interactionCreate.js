const { Events, MessageFlags } = require('discord.js');
const { logError } = require('../utils/logger');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (error) {
        logError(`Command "${interaction.commandName}"`, error);
        await replyError(interaction);
      }
      return;
    }

    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command?.autocomplete) return;
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        logError(`Autocomplete "${interaction.commandName}"`, error);
      }
      return;
    }

    let store;
    if (interaction.isButton()) store = client.buttons;
    else if (interaction.isAnySelectMenu()) store = client.selectMenus;
    else if (interaction.isModalSubmit()) store = client.modals;
    else return;

    const handler = resolve(store, interaction.customId);
    if (!handler) return;
    try {
      await handler.execute(interaction);
    } catch (error) {
      logError(`Component "${interaction.customId}"`, error);
      await replyError(interaction);
    }
  },
};

function resolve(store, customId) {
  if (store.has(customId)) return store.get(customId);
  for (const [id, handler] of store) {
    if (handler.prefix && customId.startsWith(id)) return handler;
  }
  return null;
}

async function replyError(interaction) {
  if (!interaction.isRepliable()) return;
  const payload = { content: 'There was an error while handling this interaction.', flags: MessageFlags.Ephemeral };
  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(payload).catch(() => { });
  } else {
    await interaction.reply(payload).catch(() => { });
  }
}

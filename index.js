const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const config = require('./config');
const loadCommands = require('./handlers/commandHandler');
const loadEvents = require('./handlers/eventHandler');
const loadComponents = require('./handlers/componentHandler');
const { logError } = require('./utils/logger');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction],
  // Be a bit more tolerant of flaky networks when talking to Discord's API.
  rest: { timeout: 30_000, retries: 5 },
});

client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();

loadCommands(client);
loadComponents(client);
loadEvents(client);

// Safety nets so a single rejection/exception can't silently kill the process.
// logError collapses transient network blips to one line and shows real bugs in full.
process.on('unhandledRejection', (error) => logError('Unhandled promise rejection', error));
process.on('uncaughtException', (error) => logError('Uncaught exception', error));

if (!config.token) {
  console.error('No bot token found. Copy .env.example to .env and set TOKEN.');
  process.exit(1);
}

client.login(config.token);

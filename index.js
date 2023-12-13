const { Client, GatewayIntentBits, Partials, REST, Routes } = require('discord.js');
const { readdirSync } = require('fs');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent], partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction] });
const { token, guild_id, client_id } = require('./config.json');

const commands = [];
const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (file.replace('.js', '') !== command.data.name) {
    console.log(`Error: ${file} - ${command.data.name}`);
  } else {
    console.log(`Loaded: ${file} - ${command.data.name}`);
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    if (guild_id === 'GLOBAL') {
      await rest.put(
        Routes.applicationCommands(client_id),
        { body: commands },
      );
    } else {
      await rest.put(
        Routes.applicationGuildCommands(client_id, guild_id),
        { body: commands },
      );
    }
    console.log('Commands launched!');
  } catch (error) {
    console.error(error);
  }
})();

client.on('ready', () => {
  console.log(`---------------------------------------------\nName: ${client.user.username}\nUser: ${client.users.cache.size}\nServer: ${client.guilds.cache.size}\nBot started!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;
  try {
    const command = require(`./commands/${commandName}.js`);
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'An error occurred!', ephemeral: true });
  }
});

client.login(token);
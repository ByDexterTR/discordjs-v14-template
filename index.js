const fs = require('fs');
const { Client, GatewayIntentBits, Partials, REST, Routes, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent], partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction] });
const { token, guild_id, client_id } = require('./config.json');

client.commands = new Collection();
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
    console.log(`Loaded command: ${command.data.name}`);
  } else {
    console.warn(`Skipping invalid command file: ${file}`);
  }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    if (guild_id) {
      await rest.put(Routes.applicationGuildCommands(client_id, guild_id), { body: commands });
    } else {
      await rest.put(Routes.applicationCommands(client_id), { body: commands });
    }
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error refreshing application (/) commands:', error);
  }
})();

client.on('ready', () => {
  console.log(`---------------------------------------------\nName: ${client.user.username}\nUser: ${client.users.cache.size}\nServer: ${client.guilds.cache.size}\nBot started!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing command ${interaction.commandName}:`, error);
    await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
  }
});

client.on('guildMemberAdd', member => { // Autorole
  try {
    const data = JSON.parse(fs.readFileSync('./data/autorole.json', 'utf8'));
    const roles = data[member.guild.id];

    if (roles && roles.length > 0) {
      roles.forEach(roleId => {
        const role = member.guild.roles.cache.get(roleId);
        if (role) {
          member.roles.add(role).catch(console.error);
        }
      });
    }
  } catch (error) {
    console.error('Failed to assign autoroles:', error.message);
  }
});

client.login(token);
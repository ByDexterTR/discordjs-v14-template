const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, REST, Routes, Collection } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction]
});
const { token, guild_id, client_id } = require(path.join(__dirname, 'config.json'));

client.commands = new Collection();
const commands = [];
const commandsDir = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

async function loadCommands() {
  for (const file of commandFiles) {
    try {
      const command = require(path.join(commandsDir, file));
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        console.log(`Loaded command: ${command.data.name}`);
      } else {
        console.warn(`Skipping invalid command file: ${file}`);
      }
    } catch (err) {
      console.error(`Failed to load command file ${file}:`, err);
    }
  }
}

async function updateSlashCommands() {
  const rest = new REST({ version: '10' }).setToken(token);
  try {
    if (guild_id) {
      await rest.put(Routes.applicationCommands(client_id), { body: [] });
      await rest.put(Routes.applicationGuildCommands(client_id, guild_id), { body: commands });
      console.log('Cleared global commands and updated guild commands.');
    } else {
      const guilds = await client.guilds.fetch();
      for (const [id] of guilds) {
        try {
          await rest.put(Routes.applicationGuildCommands(client_id, id), { body: [] });
          console.log(`Cleared commands for guild: ${id}`);
        } catch (err) {
          console.warn(`Could not clear commands for guild: ${id}`, err);
        }
      }
      await rest.put(Routes.applicationCommands(client_id), { body: commands });
      console.log('Updated global commands.');
    }
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error refreshing application (/) commands:', error);
  }
}

async function main() {
  await loadCommands();
  await client.login(token);
  client.once('ready', async () => {
    await updateSlashCommands();
    console.log(`---------------------------------------------\nName: ${client.user.username}\nUser: ${client.users.cache.size}\nServer: ${client.guilds.cache.size}\nBot started!`);
  });
}

main();

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

client.on('guildMemberAdd', async member => { // Autorole
  try {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'autorole.json'), 'utf8'));
    const roles = data[member.guild.id];

    if (roles && roles.length > 0) {
      for (const roleId of roles) {
        const role = member.guild.roles.cache.get(roleId);
        if (role) {
          await member.roles.add(role).catch(console.error);
        }
      }
    }
  } catch (error) {
    console.error('Failed to assign autoroles:', error.message);
  }
});
require('dotenv').config();
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const { connect } = require('./utils/database');
const { loadEvents } = require('./utils/helpers');
const { loadCommands } = require('./utils/helpers');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();
client.cooldowns = new Collection();

async function deployCommands() {
  try {
    const commands = [];
    const commandFiles = [];

    // Get all command files
    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);
    
    for (const folder of commandFolders) {
      const commandsPath = path.join(foldersPath, folder);
      const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
      commandFiles.push(...files.map(file => path.join(commandsPath, file)));
    }

    // Prepare commands for deployment
    for (const file of commandFiles) {
      const command = require(file);
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
      }
    }

    const rest = new REST().setToken(process.env.TOKEN);
    
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // Deploy commands
    const data = await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('Failed to deploy commands:', error);
  }
}

(async () => {
  await connect();
  await loadEvents(client);
  await loadCommands(client);
  
  client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    await deployCommands(); // Deploy commands when bot is ready
  });

  await client.login(process.env.TOKEN);
})();

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

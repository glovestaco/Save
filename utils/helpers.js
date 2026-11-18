const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const logger = require('./logger');

async function loadEvents(client) {
  const eventsPath = path.join(__dirname, '../events');
  
  const load_files = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.lstatSync(filePath);
      if (stat.isDirectory()) {
        load_files(filePath); // Recurse into subdirectory
      } else if (file.endsWith('.js')) {
        try {
          const event = require(filePath);
          if (event.name && typeof event.execute === 'function') {
            const eventNameForLog = path.relative(eventsPath, filePath).replace(/\\/g, '/'); // For cleaner logging, ensure forward slashes
            if (event.once) {
              client.once(event.name, (...args) => event.execute(...args, client));
            } else {
              client.on(event.name, (...args) => event.execute(...args, client));
            }
            logger.info(`Loaded event: ${eventNameForLog} (name: ${event.name})`);
          } else {
            logger.warn(`Event file at ${filePath} is missing 'name' or 'execute' property.`);
          }
        } catch (error) {
          logger.error(`Error loading event file ${filePath}: ${error.message}`);
        }
      }
    }
  };
  
  load_files(eventsPath);
}

async function loadCommands(client) {
  client.commands = new Collection();
  const commandsPath = path.join(__dirname, '../commands');
  const commandFolders = fs.readdirSync(commandsPath);

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);
      
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        logger.info(`Loaded command: ${folder}/${command.data.name}`);
      } else {
        logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }
}

module.exports = { loadEvents, loadCommands };

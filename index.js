/* eslint-disable no-restricted-syntax */
import { Client, Collection, Intents } from 'discord.js';

import { getCommandFiles, getToken, resetWatcher, runWatcher, getPrice } from './util';
import { COMMANDS_DIR_PATH } from './config';
// import './keep-alive';

// const TOKEN = getToken();
// const commandFiles = getCommandFiles();
// const client = new Client({
//     intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
// });

// client.commands = new Collection();
// // init watcher config
// resetWatcher(client);

// for (const file of commandFiles) {
//     const command = import(`${COMMANDS_DIR_PATH}/${file}`);
//     // Set a new item in the Collection
//     // With the key as the command name and the value as the exported module
//     client.commands.set(command.data.name, command);
// }

// // When the client is ready, run this code (only once)
// client.once('ready', async () => {
//     await runWatcher(client);
//     console.log('Floor price bot is online!');
// });

// trigger commands
// client.on('interactionCreate', async (interaction) => {
//     if (!interaction.isCommand()) return;

//     const command = client.commands.get(interaction.commandName);

//     if (!command) return;

//     try {
//         await command.execute(client, interaction);
//     } catch (error) {
//         console.error(error);
//         await interaction.reply({
//             content: 'There was an error while executing this command!',
//             ephemeral: true,
//         });
//     }
// });

// Login to Discord with your client's token
// client.login(TOKEN);

getPrice('doodles-official')

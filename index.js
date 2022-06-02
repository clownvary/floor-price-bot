/* eslint-disable no-await-in-loop */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-restricted-syntax */
import { Client, Collection, Intents } from 'discord.js';

import { getCommandFiles, getToken, stopWatcher, runWatcher } from './util';
import { COMMANDS_DIR_PATH } from './config';
import { mainWork } from './mainWork';

import './keep-alive';

const TOKEN = getToken();
const commandFiles = getCommandFiles();
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
});

client.commands = new Collection();
// // init watcher config
stopWatcher(client);

for (const file of commandFiles) {
    const { default: command } = await import(`${COMMANDS_DIR_PATH}/${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', async () => {
    await runWatcher(client, null, mainWork);
    console.log('Floor price bot is online!');
});

// trigger commands
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(client, interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
        });
    }
});

// Login to Discord with your client's token
client.login(TOKEN);

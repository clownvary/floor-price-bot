/* eslint-disable no-await-in-loop */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-restricted-syntax */
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

import { CLIENT_ID, GUILD_ID, COMMANDS_DIR_PATH } from './config';
import { getCommandFiles, getToken } from './util';

const commands = [];
const TOKEN = getToken();
const rest = new REST({ version: '9' }).setToken(TOKEN);
const commandFiles = getCommandFiles();

for (const file of commandFiles) {
    const { default: command } = await import(`${COMMANDS_DIR_PATH}/${file}`);
    commands.push(command.data.toJSON());
}
// regist commands
rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch((error) => console.error(error));

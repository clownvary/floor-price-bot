/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable dot-notation */
/* eslint-disable consistent-return */
import 'dotenv/config';
import fs from 'fs';
import axios from 'axios';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { TARGET_URL, COMMANDS_DIR_PATH, CHANNEL_ID, WATCH_TIMEOUT } from './config';

const getCommandFiles = () => {
    return fs.readdirSync(COMMANDS_DIR_PATH).filter((file) => file.endsWith('.js'));
};

const getDb = () => {
    const db = new JsonDB(new Config('db', true, true, '/'));
    return db;
};
const getToken = () => {
    return process.env['TOKEN'];
};
const resetWatcher = (client) => {
    client.enableWatch = false;
    client.interval = null;
    client.count = 0;
};
const sendMessage = async (client, interaction, message) => {
    if (interaction) {
        await interaction.reply(message);
    } else {
        await client.channels.cache.get(CHANNEL_ID).send(message);
    }
};
const runWatcher = async (client, interaction = null, doSomething) => {
    const { interval, enableWatch } = client;

    const watcher = async () => {
        const { enableWatch: currentEnableWatch } = client;
        if (currentEnableWatch) {
            client.user.setActivity(`| ${client.count++}`, { type: 'WATCHING' });
        } else {
            clearInterval(interval);
            resetWatcher(client);
            client.user.setActivity('UNWATCHING');
        }
    };
    if (enableWatch && interval) {
        await sendMessage(client, interaction, 'still have a watcher running...');
    } else {
        client.enableWatch = true;
        client.interval = setInterval(watcher, WATCH_TIMEOUT);
        await sendMessage(client, interaction, 'run new watcher...');
    }
};

const getPrice = (collectionName) => {
    const apiUrl = `https://api.opensea.io/api/v1/collection/${collectionName}/stats`;
    const stats = axios
        .get(apiUrl, {
            headers: {
                Accept: 'application/json',
                Host: 'api.opensea.io',
            },
        })
        .then((res) => {
            console.log('res', res);
        });
    console.log('stats', stats);
};

export { getCommandFiles, getDb, getToken, resetWatcher, sendMessage, runWatcher, getPrice };

/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable dot-notation */
/* eslint-disable consistent-return */
import 'dotenv/config';
import fs from 'fs';
import axios from 'axios';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { COMMANDS_DIR_PATH, CHANNEL_ID, WATCH_TIMEOUT, ALERT_INTERNAL } from './config';

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
const stopWatcher = (client) => {
    client.enableWatch = false;
    client.interval = null;
    client.count = 0;
};
const sendMessage = async (client, interaction, message) => {
    if (interaction && !interaction.replied && !interaction.deferred) {
        await interaction.reply(message);
    } else {
        await client.channels.cache.get(CHANNEL_ID).send(message);
    }
};
const runWatcher = async (client, interaction = null, mainWork) => {
    const { interval, enableWatch } = client;

    const watcher = async () => {
        const { enableWatch: currentEnableWatch } = client;
        if (currentEnableWatch) {
            // do main logic here
            await mainWork(client, interaction);
            client.user.setActivity(`| ${client.count++}`, { type: 'WATCHING' });
        } else {
            clearInterval(interval);
            stopWatcher(client);
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

const getStats = async (collectionName) => {
    const apiUrl = `https://api.opensea.io/api/v1/collection/${collectionName}/stats`;
    let result = {};
    try {
        const {
            data: { stats },
        } = await axios.get(apiUrl, {
            headers: {
                Accept: 'application/json',
                Host: 'api.opensea.io',
            },
        });
        result = stats;
    } catch (error) {
        console.error('request opensea api error', error);
    }
    return result;
};

// whether current now time is a valid trigger time
const isValidTrigger = (lastAlertStamp, currentStamp) => {
    return currentStamp - lastAlertStamp > ALERT_INTERNAL * 1000;
};

export { getCommandFiles, getDb, getToken, stopWatcher, sendMessage, runWatcher, getStats, isValidTrigger };

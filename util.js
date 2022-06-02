/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable dot-notation */
/* eslint-disable consistent-return */
import 'dotenv/config';
import fs from 'fs';
import axios from 'axios';
import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import { MessageEmbed } from 'discord.js';
import {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    NoSubscriberBehavior,
    VoiceConnectionStatus,
    AudioPlayerStatus,
} from '@discordjs/voice';
import { COMMANDS_DIR_PATH, CHANNEL_ID, WATCH_TIMEOUT, ALERT_INTERNAL, GUILD_ID, VOICE_CHANNEL_ID, ALERT_PATH } from './config';

const MESSAGE_TYPE = {
    INFO: 'Info',
    WARN: 'Warn',
    ERROR: 'Error',
    SUCCEED: 'Succeed',
};
const MESSAGE_TYPE_COLOR = {
    [MESSAGE_TYPE.INFO]: '#0099ff', // blue
    [MESSAGE_TYPE.WARN]: '#ecea2c', // yellow
    [MESSAGE_TYPE.ERROR]: '#e2053e', // red
    [MESSAGE_TYPE.SUCCEED]: '#05e226', // green
};
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
const sendMessage = async (client, interaction, message, type = MESSAGE_TYPE.INFO, fieldTitle) => {
    const title = fieldTitle || type;
    const exampleEmbed = new MessageEmbed().setColor(MESSAGE_TYPE_COLOR[type]).addField(title, message, true);
    if (interaction && !interaction.replied && !interaction.deferred) {
        await interaction.reply({ embeds: [exampleEmbed], ephemeral: false });
    } else {
        await client.channels.cache.get(CHANNEL_ID).send({ embeds: [exampleEmbed] });
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

const getSingleStats = async (collectionName) => {
    const apiUrl = `https://api.opensea.io/api/v1/collection/${collectionName}/stats`;
    let result = {};
    try {
        result = await axios.get(apiUrl, {
            headers: {
                Accept: 'application/json',
                Host: 'api.opensea.io',
            },
        });
    } catch (error) {
        // console.error('request opensea api error', error);
    }
    return result;
};

const getStats = async (collectionName) => {
    const {
        data: { stats },
    } = await getSingleStats(collectionName);
    return stats;
};

const isValidNewCollection = async (collectionName, price) => {
    const db = getDb();
    const collections = db.getData('/collections');
    const result = { validName: false, validPrice: false };
    const isExisted = collections.filter((collection) => collection.name === collectionName).length >= 1;
    const { status, data: { stats = {} } = {} } = await getSingleStats(collectionName);
    if (status === 200 && !isExisted) {
        result.validName = true;
        // watch price must lower than current price
        if (price < stats.floor_price) {
            result.validPrice = true;
        }
    }
    return result;
};

// whether current now time is a valid trigger time
const isValidTrigger = (lastAlertStamp, currentStamp) => {
    return currentStamp - lastAlertStamp > ALERT_INTERNAL * 1000;
};

const getPlayer = () => {
    const player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
        },
    });
    const resource = createAudioResource(ALERT_PATH);
    player.play(resource);
    return player;
};
const getVoiceConnection = (client) => {
    const connection = joinVoiceChannel({
        channelId: VOICE_CHANNEL_ID,
        guildId: GUILD_ID,
        adapterCreator: client.channels.cache.get(VOICE_CHANNEL_ID).guild.voiceAdapterCreator,
    });
    return connection;
};
const playAlertSound = (client) => {
    const player = getPlayer();
    const connection = getVoiceConnection(client);
    const subscription = connection.subscribe(player);
    // subscription could be undefined if the connection is destroyed!
    if (subscription) {
        // Unsubscribe after 5 seconds (stop playing audio on the voice connection)
        setTimeout(() => {
            subscription.unsubscribe();
        }, 10000);
    }
};

export {
    getCommandFiles,
    getDb,
    getToken,
    sendMessage,
    runWatcher,
    stopWatcher,
    getStats,
    isValidTrigger,
    isValidNewCollection,
    MESSAGE_TYPE,
    playAlertSound,
};

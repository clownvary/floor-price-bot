/* eslint-disable no-restricted-syntax */
import { SlashCommandBuilder } from '@discordjs/builders';
import { sendMessage, getDb, MESSAGE_TYPE } from '../util';

export default {
    data: new SlashCommandBuilder().setName('list_collections_floor').setDescription('List all watched collections'),
    async execute(client, interaction) {
        const db = getDb();
        const collections = db.getData('/collections');
        let message = '';
        for (const [index, collection] of collections.entries()) {
            const { name, price } = collection;
            message += `${index}.${name}   ${price}e\n`;
        }
        message += 'please use index number before every collection to remove if you need';
        sendMessage(client, interaction, message, MESSAGE_TYPE.INFO, 'Current watching list');
    },
};

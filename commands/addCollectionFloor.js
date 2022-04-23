import { SlashCommandBuilder } from '@discordjs/builders';
import { sendMessage, isValidNewCollection, getDb, MESSAGE_TYPE } from '../util';

export default {
    data: new SlashCommandBuilder()
        .setName('add_collection_floor')
        .addStringOption((option) => option.setName('name').setDescription('Enter collection name').setRequired(true))
        .addNumberOption((option) => option.setName('price').setDescription('Enter expected price').setRequired(true))
        .setDescription('Add new collection floor price for watching'),
    async execute(client, interaction) {
        const name = interaction.options.getString('name');
        const price = interaction.options.getNumber('price');
        const { validName, validPrice } = await isValidNewCollection(name, price);
        const isValid = validName && validPrice;
        if (isValid) {
            const db = getDb();
            db.push('/collections[]', { name, price }, true);
            sendMessage(
                client,
                interaction,
                `new collection ${name} is added \nwhen price lower than ${price} will alert you`,
                MESSAGE_TYPE.SUCCEED,
                'Succeed to add',
            );
        } else {
            sendMessage(
                client,
                interaction,
                'please recheck your collection name and price \ncollection name must exist in opensea and not existed in wather \nprice must lower than current floor price ',
                MESSAGE_TYPE.WARN,
                'Failed to add',
            );
        }
    },
};

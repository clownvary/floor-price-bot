/* eslint-disable no-restricted-syntax */
import { SlashCommandBuilder } from '@discordjs/builders';
import { sendMessage, getDb, MESSAGE_TYPE, getStats } from '../util';

export default {
    data: new SlashCommandBuilder()
        .setName('update_collection_floor')
        .addIntegerOption((option) =>
            option
                .setName('collection_index')
                .setDescription('Enter collection index, you can get it from command /list_collections_floor')
                .setRequired(true),
        )
        .addNumberOption((option) =>
            option.setName('new_price').setDescription("Enter collection's new price").setRequired(true),
        )
        .setDescription("Update a collection's floor price"),
    async execute(client, interaction) {
        const db = getDb();
        const collections = db.getData('/collections');
        const newPrice = interaction.options.getNumber('new_price');
        const collectionIndex = interaction.options.getInteger('collection_index');
        const collection = collections[collectionIndex];
        const { name, price: oldPrice } = collection;
        const validIndex = collectionIndex >= 0 && collectionIndex < collections.length;
        const { floor_price: floorPrice } = await getStats(name);
        const isValid = validIndex && newPrice < floorPrice;
        if (isValid) {
            db.push(`/collections[${collectionIndex}]`, { ...collection, price: newPrice }, true);
            sendMessage(
                client,
                interaction,
                `new price of collection ${name} was updated from ${oldPrice} to ${newPrice}`,
                MESSAGE_TYPE.SUCCEED,
                'Succeed to update',
            );
        } else {
            sendMessage(
                client,
                interaction,
                `please recheck your collection index and price \nindex should be within 0~${collections.length}\nprice must lower than current floor price ${floorPrice}`,
                MESSAGE_TYPE.WARN,
                'Failed to update',
            );
        }
    },
};

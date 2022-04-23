import { SlashCommandBuilder } from '@discordjs/builders';
import { sendMessage, getDb, MESSAGE_TYPE } from '../util';

export default {
    data: new SlashCommandBuilder()
        .setName('remove_collection_floor')
        .addIntegerOption((option) =>
            option
                .setName('collection_index')
                .setDescription('Enter collection index, you can get it from command /list_collections_floor')
                .setRequired(true),
        )
        .setDescription('Remove a collection from watching list'),
    async execute(client, interaction) {
        const db = getDb();
        const collections = db.getData('/collections');
        const collectionIndex = interaction.options.getInteger('collection_index');
        const isValid = collectionIndex >= 0 && collectionIndex < collections.length;
        if (isValid) {
            const { name } = collections[collectionIndex];
            db.delete(`/collections[${collectionIndex}]`);
            sendMessage(
                client,
                interaction,
                `collection ${name} was removed`,
                MESSAGE_TYPE.SUCCEED,
                'Succeed to remove',
            );
        } else {
            sendMessage(
                client,
                interaction,
                `please recheck your collection index, it should be within 0~${collections.length}`,
                MESSAGE_TYPE.WARN,
                'Failed to remove',
            );
        }
    },
};

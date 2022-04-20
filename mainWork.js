/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { getStats, getDb, sendMessage } from './util';

export const mainWork = async (client, interaction) => {
    const db = getDb();
    const collections = db.getData('/collections') || [];
    for (const collection of collections) {
        const { name, price } = collection;
        const { floor_price: floorPrice } = await getStats(name);
        console.log('floorprice', name, floorPrice);
        if (floorPrice <= price) {
            sendMessage(
                client,
                interaction,
                `@everyone ${name} just hit a floor price of ${price}! \n https://opensea.io/collection/${name}`,
            );
        }
    }
};

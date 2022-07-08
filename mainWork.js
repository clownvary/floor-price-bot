/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { getStats, getDb, sendMessage, isValidTrigger, MESSAGE_TYPE } from './util';

export const mainWork = async (client, interaction) => {
    const db = getDb();
    const collections = db.getData('/collections') || [];
    const pQueue = [];
    const alertOriginIndex = [];
    const alertCollections = collections.filter((collection, index) => {
        const now = new Date().getTime();
        const { lastAlertStamp='', name } = collection;
        const isValid = isValidTrigger(lastAlertStamp, now);
        if (isValid) {
            pQueue.push(getStats(name));
            alertOriginIndex.push(index);
        }
        return isValid;
    });

    const alertCollectionsStats = await Promise.all(pQueue);
    for (const [index, stats] of alertCollectionsStats.entries()) {
        const { name, price } = alertCollections[index];
        const now = new Date().getTime();
        const { floor_price: floorPrice } = stats;
        db.push(`/collections[${alertOriginIndex[index]}]`, {
            ...alertCollections[index],
            lastAlertStamp: now,
        });
        if (floorPrice <= price) {
            sendMessage(
                client,
                interaction,
                `@everyone ${name} just hit a floor price of ${price}! \n https://opensea.io/collection/${name}`,
                MESSAGE_TYPE.INFO,
                'Wow! Wow! Wow!',
            );
        }
    }
};

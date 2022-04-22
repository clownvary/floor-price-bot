/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { getStats, getDb, sendMessage, isValidTrigger } from './util';

export const mainWork = async (client, interaction) => {
    console.log('========Main Work=======');
    const db = getDb();
    const collections = db.getData('/collections') || [];
    const pQueue = [];
    const alertOriginIndex = [];
    const alertCollections = collections.filter((collection, index) => {
        const now = new Date().getTime();
        const { lastAlertStamp, name } = collection;
        const isValid = name !== isValidTrigger(lastAlertStamp, now);
        if (isValid) {
            pQueue.push(getStats(name));
            alertOriginIndex.push(index);
            console.log('valid index', name, index);
        }
        return isValid;
    });

    const alertCollectionsStats = await Promise.all(pQueue);
    for (const [index, stats] of alertCollectionsStats.entries()) {
        const { name, price } = alertCollections[index];
        const now = new Date().getTime();
        const { floor_price: floorPrice } = stats;
        console.log('push new stamp', name, index, alertOriginIndex[index]);
        console.log('alertCollections', alertCollections[index]);
        db.push(`/collections[${alertOriginIndex[index]}]`, {
            ...alertCollections[index],
            lastAlertStamp: now,
        });
        if (floorPrice <= price) {
            sendMessage(
                client,
                interaction,
                `@everyone ${name} just hit a floor price of ${price}! \n https://opensea.io/collection/${name}`,
            );
        }
    }
    // for (const [index, collection] of collections.entries()) {
    //     const { name, price, lastAlertStamp } = collection;
    //     const now = new Date().getTime();
    //     const isValid = isValidTrigger(lastAlertStamp, now);
    //     if (isValid) {
    //         console.log('start getstats 1');
    //         const { floor_price: floorPrice } = await getStats(name);
    //         console.log('end getstats 3');
    //         db.push(`/collections[${index}]`, {
    //             ...collection,
    //             lastAlertStamp: now,
    //         });
    //         if (floorPrice <= price) {
    //             sendMessage(
    //                 client,
    //                 interaction,
    //                 `@everyone ${name} just hit a floor price of ${price}! \n https://opensea.io/collection/${name}`,
    //             );
    //         }
    //     } else {
    //         console.log('no need to trigger', name);
    //     }
    // }
};

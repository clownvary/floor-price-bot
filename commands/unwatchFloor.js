import { SlashCommandBuilder } from '@discordjs/builders';
import { sendMessage, stopWatcher } from '../util';

export default {
    data: new SlashCommandBuilder()
        .setName('unwatch_floor')
        .setDescription('Cancel watching floor price of collections'),
    async execute(client, interaction) {
        const { enableWatch } = client;
        if (enableWatch) {
            stopWatcher(client);
            await sendMessage(client, interaction, 'watcher removed...');
            client.user.setActivity('UNWATCHING');
        } else {
            await sendMessage(client, interaction, 'no watcher to remove...');
        }
    },
};

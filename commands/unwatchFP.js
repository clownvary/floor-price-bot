import { SlashCommandBuilder } from '@discordjs/builders';
import { send, resetWatcherConfig } from '../util';

module.exports = {
    data: new SlashCommandBuilder().setName('unwatch').setDescription('Cancel watching floor price of collections'),
    async execute(client, interaction) {
        const { enableWatch } = client;
        if (enableWatch) {
            resetWatcherConfig(client);
            await send(client, interaction, 'watcher removed...');
            client.user.setActivity('UNWATCHING');
        } else {
            await send(client, interaction, 'no watcher to remove...');
        }
    },
};

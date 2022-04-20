import { SlashCommandBuilder } from '@discordjs/builders';
import { runWatcher } from '../util';

module.exports = {
    data: new SlashCommandBuilder().setName('watchFP').setDescription('Start watching floor price of collections'),
    async execute(client, interaction) {
        await runWatcher(client, interaction);
    },
};

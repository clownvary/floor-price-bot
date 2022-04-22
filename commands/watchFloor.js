import { SlashCommandBuilder } from '@discordjs/builders';
import { runWatcher } from '../util';
import { mainWork } from '../mainWork';

export default {
    data: new SlashCommandBuilder().setName('watch_floor').setDescription('Start watching floor price of collections'),
    async execute(client, interaction) {
        await runWatcher(client, interaction, mainWork);
    },
};

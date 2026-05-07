require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'daily',
        description: 'Open the daily study check-in form',
    },
    {
        name: 'history',
        description: 'View your last 5 study check-ins',
    },
    {
        name: 'stats',
        description: 'See your total study sessions and time',
    },
    {
        name: 'pomodoro',
        description: 'Start a focus timer (informational)',
        options: [
            {
                name: 'work',
                description: 'Work duration in minutes (default: 25)',
                type: ApplicationCommandOptionType.Integer,
                required: false,
            },
            {
                name: 'break',
                description: 'Break duration in minutes (default: 5)',
                type: ApplicationCommandOptionType.Integer,
                required: false,
            },
        ],
    },
    {
        name: 'stop',
        description: 'Stop your active timer',
    },
    {
        name: 'ping',
        description: 'Check the bot latency',
    },
    {
        name: 'help',
        description: 'Show the help menu',
    },
    {
        name: 'test',
        description: 'Basic bot check',
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.APP_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
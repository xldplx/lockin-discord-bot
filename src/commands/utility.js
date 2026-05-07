const { InteractionResponseType } = require('discord-interactions');

async function handlePing(interaction) {
    return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: '🏓 Pong!' }
    };
}

async function handleTest(interaction) {
    return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: '✅ Bot testing. Works. No worries.' }
    };
}

async function handleHelp(interaction) {
    return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            embeds: [{
                color: 0x5865F2,
                title: '📖 LockIn Bot Help',
                description: 'Here are the available commands to help you stay productive!',
                fields: [
                    { name: 'Slash Commands', value: '`/daily` - Open the study check-in form\n`/history` - View your last 5 check-ins\n`/stats` - See your total study sessions\n`/pomodoro` - Start a focus timer\n`/stop` - Cancel your active timer\n`/ping` - Check bot latency\n`/help` - Show this menu' }
                ],
                footer: { text: 'Stay focused and keep locking in! 🚀' }
            }]
        }
    };
}

module.exports = {
    handlePing,
    handleTest,
    handleHelp
};

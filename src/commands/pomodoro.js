const { InteractionResponseType } = require('discord-interactions');

async function handleCommand(interaction) {
    const workMin = interaction.data.options?.find(o => o.name === 'work')?.value || 25;
    const breakMin = interaction.data.options?.find(o => o.name === 'break')?.value || 5;
    const userId = interaction.member?.user?.id || interaction.user?.id;

    return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `🔥 **Pomodoro Started!**\n` +
                     `Working for **${workMin} minutes**, then a **${breakMin} minute** break.\n` +
                     `Good luck, <@${userId}>!\n\n` +
                     `> ⚠️ **Note:** Since this bot is running on Vercel, I cannot send a notification when the timer ends. Please set a manual alarm on your phone/computer! ⏰`
        }
    };
}

async function handleStop(interaction) {
    const userId = interaction.member?.user?.id || interaction.user?.id;
    return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `🛑 Pomodoro "stopped", <@${userId}>. Take a rest!`
        }
    };
}

module.exports = {
    handleCommand,
    handleStop
};

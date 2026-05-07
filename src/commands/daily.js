const { InteractionResponseType, TextInputStyle } = require('discord-interactions');
const axios = require('axios');

const CHECKIN_CHANNEL_ID = '1498212051489656883';

async function handleCommand(interaction) {
    return {
        type: InteractionResponseType.MODAL,
        data: {
            custom_id: 'dailyCheckinModal',
            title: 'Daily Check-in',
            components: [
                { type: 1, components: [{ type: 4, custom_id: 'dateInput', label: 'Date', style: 1, placeholder: 'e.g., 4/30/2026', required: true }] },
                { type: 1, components: [{ type: 4, custom_id: 'timeInput', label: 'Study Time', style: 1, placeholder: 'e.g., 4 hours', required: true }] },
                { type: 1, components: [{ type: 4, custom_id: 'studiedInput', label: 'What I Studied', style: 2, required: true }] },
                { type: 1, components: [{ type: 4, custom_id: 'understoodInput', label: 'What I Understood', style: 2, required: true }] },
                { type: 1, components: [{ type: 4, custom_id: 'failedInput', label: 'What I Failed At', style: 2, required: true }] }
            ]
        }
    };
}

async function handleModal(interaction) {
    const fields = interaction.data.components.reduce((acc, row) => {
        const component = row.components[0];
        acc[component.custom_id] = component.value;
        return acc;
    }, {});

    const { dateInput, timeInput, studiedInput, understoodInput, failedInput } = fields;
    const userId = interaction.member?.user?.id || interaction.user?.id;

    const formattedMessage =
        `🗓️ **Date:** ${dateInput}\n` +
        `⏱️ **Study time:** ${timeInput}\n` +
        `📚 **What I studied:** ${studiedInput}\n` +
        `🧠 **What I understood:** ${understoodInput}\n` +
        `❌ **What I failed at:** ${failedInput}\n\n` +
        `**SENT BY <@${userId}>**`;

    try {
        // Send to the log channel using REST API
        await axios.post(
            `https://discord.com/api/v10/channels/${CHECKIN_CHANNEL_ID}/messages`,
            { content: formattedMessage },
            { headers: { Authorization: `Bot ${process.env.TOKEN}` } }
        );

        return {
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '✅ Log sent to daily-checkin!', flags: 64 } // Ephemeral
        };
    } catch (error) {
        console.error('Error sending log:', error.response?.data || error.message);
        return {
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ Failed to send log to the channel.', flags: 64 }
        };
    }
}

module.exports = {
    handleCommand,
    handleModal
};

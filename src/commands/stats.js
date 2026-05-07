const { InteractionResponseType } = require('discord-interactions');
const axios = require('axios');
const { editOriginalResponse } = require('../utils/discord');

const CHECKIN_CHANNEL_ID = '1498212051489656883';

async function handleHistory(interaction) {
    // Initial response: Defer
    // Note: We can't actually "defer" and then continue in the same serverless function easily 
    // without using something like Vercel's `waitUntil` or background execution.
    // However, fetching 100 messages is usually < 1s. Let's try to do it synchronously first.
    
    return await processStats(interaction, 'history');
}

async function handleStats(interaction) {
    return await processStats(interaction, 'stats');
}

async function processStats(interaction, type) {
    const userId = interaction.member?.user?.id || interaction.user?.id;
    const username = interaction.member?.user?.username || interaction.user?.username;

    try {
        const response = await axios.get(
            `https://discord.com/api/v10/channels/${CHECKIN_CHANNEL_ID}/messages?limit=100`,
            { headers: { Authorization: `Bot ${process.env.TOKEN}` } }
        );

        const messages = response.data;
        const userLogs = [];

        messages.forEach(msg => {
            // Check if the message contains the user's ID and was sent by the bot (interaction handler logs)
            // In the new version, the bot sends the log.
            if (msg.content.includes(`<@${userId}>`)) {
                const lines = msg.content.split('\n');
                const entry = {
                    date: lines.find(l => l.includes('Date:'))?.split('**Date:**')[1]?.trim() || 'Unknown',
                    time: lines.find(l => l.includes('Study time:'))?.split('**Study time:**')[1]?.trim() || '0',
                    studied: lines.find(l => l.includes('What I studied:'))?.split('**What I studied:**')[1]?.trim() || 'N/A'
                };
                userLogs.push(entry);
            }
        });

        if (type === 'history') {
            if (userLogs.length === 0) {
                return {
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: { content: "📭 You haven't submitted any logs yet!", flags: 64 }
                };
            }

            const embeds = [{
                color: 0x00FF00,
                title: '📚 Your Recent History',
                description: `Last ${Math.min(userLogs.length, 5)} entries:`,
                fields: userLogs.slice(0, 5).map((log, index) => ({
                    name: `${index + 1}. ${log.date}`,
                    value: `⏱️ **Time:** ${log.time}\n📖 **Studied:** ${log.studied.substring(0, 100)}...`
                }))
            }];

            return {
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { embeds, flags: 64 }
            };
        } else {
            // Stats logic
            const totalSessions = userLogs.length;
            let totalMinutes = 0;

            userLogs.forEach(log => {
                const timeStr = log.time.toLowerCase();
                const num = parseFloat(timeStr);
                if (!isNaN(num)) {
                    if (timeStr.includes('hour') || timeStr.includes('hr') || (timeStr.includes('h') && !timeStr.includes('m'))) {
                        totalMinutes += num * 60;
                    } else {
                        totalMinutes += num;
                    }
                }
            });

            const hours = Math.floor(totalMinutes / 60);
            const mins = Math.round(totalMinutes % 60);

            const embeds = [{
                color: 0xF1C40F,
                title: `📊 Study Statistics for ${username}`,
                fields: [
                    { name: 'Total Sessions', value: `${totalSessions}`, inline: true },
                    { name: 'Approx. Total Time', value: `${hours}h ${mins}m`, inline: true }
                ],
                footer: { text: 'Stats are based on the last 100 channel messages.' }
            }];

            return {
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { embeds, flags: 64 }
            };
        }
    } catch (error) {
        console.error('Stats error:', error.response?.data || error.message);
        return {
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: '❌ Something went wrong while fetching data.', flags: 64 }
        };
    }
}

module.exports = {
    handleHistory,
    handleStats
};

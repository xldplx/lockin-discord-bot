require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder,
    TextInputStyle,
    EmbedBuilder
} = require('discord.js');

// 1. Health Check for Hugging Face
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

const { setGlobalDispatcher, Agent } = require('undici');
setGlobalDispatcher(new Agent({ 
    connect: { timeout: 60000 }, // 60 seconds network-level timeout
    headersTimeout: 60000,
    bodyTimeout: 60000
}));

const http = require('http');
http.createServer((req, res) => {
    res.write('LockIn Bot is active.');
    res.end();
}).listen(7860);

// 2. Debug: Check if Token exists (without showing it)
console.log(`Checking Environment: TOKEN is ${process.env.TOKEN ? 'PRESENT' : 'MISSING'}`);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    // 3. Increase timeout for slow cloud networks
    rest: {
        timeout: 60000,
        retries: 3
    }
});

const PREFIX = '!';
const CHECKIN_CHANNEL_ID = '1498212051489656883';

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} is online!`);
});

// --- 1. FLEXIBLE PREFIX COMMANDS ---
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'test') {
        await message.reply('Bot testing. Works. No worries.');
    }

    // You can easily add more prefix commands here
    if (command === 'ping') {
        await message.reply('Pong!');
    }
});

// --- 2. MULTI-FIELD DAILY COMMAND ---
client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'daily') {
        const modal = new ModalBuilder()
            .setCustomId('dailyCheckinModal')
            .setTitle('Daily Check-in');

        // Field 1: Date
        const dateInput = new TextInputBuilder()
            .setCustomId('dateInput')
            .setLabel("Date")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g., 4/30/2026')
            .setRequired(true);

        // Field 2: Study Time
        const timeInput = new TextInputBuilder()
            .setCustomId('timeInput')
            .setLabel("Study Time")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g., 4 hours')
            .setRequired(true);

        // Field 3: What I Studied
        const studiedInput = new TextInputBuilder()
            .setCustomId('studiedInput')
            .setLabel("What I Studied")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        // Field 4: What I Understood
        const understoodInput = new TextInputBuilder()
            .setCustomId('understoodInput')
            .setLabel("What I Understood")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        // Field 5: What I Failed At
        const failedInput = new TextInputBuilder()
            .setCustomId('failedInput')
            .setLabel("What I Failed At")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        // Modals need each input in its own ActionRow
        modal.addComponents(
            new ActionRowBuilder().addComponents(dateInput),
            new ActionRowBuilder().addComponents(timeInput),
            new ActionRowBuilder().addComponents(studiedInput),
            new ActionRowBuilder().addComponents(understoodInput),
            new ActionRowBuilder().addComponents(failedInput)
        );

        await interaction.showModal(modal);
    }

    // --- 3. HANDLING THE SUBMISSION ---
    if (interaction.isModalSubmit() && interaction.customId === 'dailyCheckinModal') {
        const date = interaction.fields.getTextInputValue('dateInput');
        const time = interaction.fields.getTextInputValue('timeInput');
        const studied = interaction.fields.getTextInputValue('studiedInput');
        const understood = interaction.fields.getTextInputValue('understoodInput');
        const failed = interaction.fields.getTextInputValue('failedInput');

        // Create the formatted message string
        const formattedMessage =
            `🗓️ **Date:** ${date}\n` +
            `⏱️ **Study time:** ${time}\n` +
            `📚 **What I studied:** ${studied}\n` +
            `🧠 **What I understood:** ${understood}\n` +
            `❌ **What I failed at:** ${failed}\n\n` +
            `**SENT BY <@${interaction.user.id}>**`;

        try {
            const channel = await client.channels.fetch(CHECKIN_CHANNEL_ID);
            if (channel) {
                await channel.send(formattedMessage);
                await interaction.reply({ content: '✅ Log sent to daily-checkin!', ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Failed to send log to the channel.', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN).catch(err => {
    console.error("FAILED TO LOGIN:", err);
});

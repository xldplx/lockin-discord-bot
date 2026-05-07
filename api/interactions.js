const {
    InteractionType,
    InteractionResponseType,
    verifyKey,
} = require('discord-interactions');
const registry = require('../src/registry');

// Vercel Serverless Function
module.exports = async (req, res) => {
    // 1. Verify the request signature
    const signature = req.headers['x-signature-ed25519'];
    const timestamp = req.headers['x-signature-timestamp'];
    
    // We need the raw body for verification
    // Vercel gives us req.body but we might need it as a string
    const rawBody = JSON.stringify(req.body);

    const isValidRequest = verifyKey(
        rawBody,
        signature,
        timestamp,
        process.env.PUBLIC_KEY
    );

    if (!isValidRequest) {
        return res.status(401).end('invalid request signature');
    }

    // 2. Handle the interaction
    const interaction = req.body;

    // Discord "Ping" for URL verification
    if (interaction.type === InteractionType.PING) {
        return res.send({
            type: InteractionResponseType.PONG,
        });
    }

    // Command/Modal routing
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
        const commandName = interaction.data.name;
        const handler = registry[commandName];

        if (handler) {
            const response = await handler(interaction);
            return res.send(response);
        }
    }

    if (interaction.type === InteractionType.MODAL_SUBMIT) {
        const customId = interaction.data.custom_id;
        const handler = registry[customId];

        if (handler) {
            const response = await handler(interaction);
            return res.send(response);
        }
    }

    // Default response
    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content: 'Unknown interaction type' }
    });
};

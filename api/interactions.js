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
    
    // Use rawBody if provided (by our local server or Vercel config)
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const isValidRequest = verifyKey(
        rawBody,
        signature,
        timestamp,
        process.env.PUBLIC_KEY
    );

    if (!isValidRequest) {
        console.error('❌ [Verification Failed] Signature or Public Key is incorrect.');
        console.error('Headers:', { signature, timestamp });
        console.error('PUBLIC_KEY is:', process.env.PUBLIC_KEY ? 'Set' : 'MISSING');
        return res.status(401).end('invalid request signature');
    }

    console.log('✅ [Verification Success] Interaction received:', req.body.type);

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

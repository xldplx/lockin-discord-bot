const axios = require('axios');

/**
 * Sends a follow-up message to an interaction.
 * @param {string} token - The interaction token.
 * @param {object} payload - The message payload.
 */
async function sendFollowup(token, payload) {
    const appId = process.env.APP_ID;
    const url = `https://discord.com/api/v10/webhooks/${appId}/${token}`;
    
    try {
        await axios.post(url, payload);
    } catch (error) {
        console.error('Error sending follow-up:', error.response?.data || error.message);
    }
}

/**
 * Edit the original interaction response.
 * @param {string} token - The interaction token.
 * @param {object} payload - The message payload.
 */
async function editOriginalResponse(token, payload) {
    const appId = process.env.APP_ID;
    const url = `https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`;
    
    try {
        await axios.patch(url, payload);
    } catch (error) {
        console.error('Error editing original response:', error.response?.data || error.message);
    }
}

module.exports = {
    sendFollowup,
    editOriginalResponse
};

const express = require('express');
require('dotenv').config();
const interactionsHandler = require('./api/interactions');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to capture the raw body for signature verification
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

app.post('/api/interactions', async (req, res) => {
    // Manually call the Vercel function handler
    // We pass req and res, but we ensure req.body and req.rawBody are set
    await interactionsHandler(req, res);
});

app.listen(PORT, () => {
    console.log(`🚀 Local test server running at http://localhost:${PORT}`);
    console.log(`🔗 Use ngrok to expose this: ngrok http ${PORT}`);
    console.log(`⚠️  Make sure PUBLIC_KEY is set in your .env!`);
});

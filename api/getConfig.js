module.exports = (req, res) => {
    res.json({
        GCclientId: process.env.GC_OAUTH_CLIENT_ID,
        apiKey: process.env.OPENAI_API_KEY,
        assistantId: process.env.OPENAI_ASSISTANT_ID
    });
};

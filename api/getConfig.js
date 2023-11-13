module.exports = (req, res) => {
    res.json({
        GCclientId: process.env.GC_OAUTH_CLIENT_ID,
        OAIApiKey: process.env.OPENAI_API_KEY,
        AssistantID: process.env.OPENAI_ASSISTANT_ID
    });
};

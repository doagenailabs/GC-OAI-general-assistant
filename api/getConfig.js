module.exports = (req, res) => {
    res.json({
        GCclientId: process.env.GC_OAUTH_CLIENT_ID,
        GCclientId: process.env.OPENAI_API_KEY,
        GCclientId: process.env.OPENAI_ASSISTANT_ID        
    });
};

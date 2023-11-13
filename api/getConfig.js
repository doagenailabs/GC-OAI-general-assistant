// /api/getConfig.js

module.exports = (req, res) => {
    res.json({
        GCclientId: process.env.GC_OAUTH_CLIENT_ID,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY
    });
};

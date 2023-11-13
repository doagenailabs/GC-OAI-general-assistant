//env vars
module.exports = (req, res) => {
    res.json({
        GCclientId: process.env.GC_OAUTH_CLIENT_ID,
        UseKB: process.env.USE_KNOWLEDGE,//if false, KB section won't display in the UI
    });
};

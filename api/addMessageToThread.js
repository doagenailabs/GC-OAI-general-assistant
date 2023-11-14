const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OAIApiKey
});

async function addMessageToThread(req, res) {
    const { threadId, messageContent } = req.body;

    try {
        const message = await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: messageContent
        });
        res.json(message);
    } catch (error) {
        console.error(`Error in addMessageToThread:`, error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = addMessageToThread;

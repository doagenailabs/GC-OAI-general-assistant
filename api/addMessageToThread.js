const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: apiKey
});

async function addMessageToThread(req, res) {
    const { threadId, messageContent, fileID } = req.body;

    try {
        const messageData = {
            role: "user",
            content: messageContent
        };
        if (fileID) {
            messageData.file_ids = [fileID];
        }

        const message = await openai.beta.threads.messages.create(threadId, messageData);
        res.json(message);
    } catch (error) {
        console.error(`Error in addMessageToThread:`, error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = addMessageToThread;

const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function displayAssistantResponse(req, res) {
    const { threadId } = req.query;

    try {
        const messages = await openai.beta.threads.messages.list(threadId);
        res.json(messages);
    } catch (error) {
        console.error(`Error in displayAssistantResponse:`, error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = displayAssistantResponse;
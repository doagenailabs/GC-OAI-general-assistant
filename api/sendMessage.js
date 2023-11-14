const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OAIApiKey
});

async function sendMessage(req, res) {
    try {
        const { threadId, message } = req.body;
        const response = await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: message
        });
        console.log("Operation: sendMessage", "Response:", response);
        res.json(response);
    } catch (error) {
        console.error(`Error in sendMessage:`, error.toString());
        res.status(500).json({ error: 'An error occurred while processing the sendMessage operation', details: error.toString() });
    }
}

module.exports = { sendMessage };

const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OAIApiKey
});

async function addMessageToThread(threadId, messageContent) {
    try {
        const message = await openai.beta.threads.messages.create(threadId, {
            role: "user",
            content: messageContent
        });
        return message;
    } catch (error) {
        console.error(`Error in addMessageToThread:`, error.toString());
        throw error;
    }
}

module.exports = addMessageToThread;

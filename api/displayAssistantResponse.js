const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OAIApiKey
});

async function displayAssistantResponse(threadId) {
    try {
        const messages = await openai.beta.threads.messages.list(threadId);
        return messages;
    } catch (error) {
        console.error(`Error in displayAssistantResponse:`, error.toString());
        throw error;
    }
}

module.exports = displayAssistantResponse;

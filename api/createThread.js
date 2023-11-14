const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OAIApiKey });

async function createThread() {
    try {
        const thread = await openai.beta.threads.create();
        return thread;
    } catch (error) {
        console.error('Error in createThread:', error.toString());
        throw error;
    }
}

module.exports = createThread;

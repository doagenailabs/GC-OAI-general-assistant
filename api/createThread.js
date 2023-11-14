const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OAIApiKey
});

async function createThread() {
    console.log('Creating thread...');

    console.log(`API Key Length: ${process.env.OAIApiKey ? process.env.OAIApiKey.length : 'undefined'}`);

    try {
        const thread = await openai.beta.threads.create();
        console.log('Thread created:', thread);
        return thread;
    } catch (error) {
        console.error(`Error in createThread:`, error);

        if (error.response) {
            console.error('Response:', error.response);
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Data:', error.response.data);
        }

        throw error;
    }
}

module.exports = createThread;

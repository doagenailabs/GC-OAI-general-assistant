const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function createThread(req, res) {
    console.log('Creating thread...');

    console.log(`API Key Length: ${process.env.OAIApiKey ? process.env.OAIApiKey.length : 'undefined'}`);

    try {
        const thread = await openai.beta.threads.create();
        console.log('Thread created:', thread);


        res.json(thread);
    } catch (error) {
        console.error(`Error in createThread:`, error);


        if (error.response) {
            console.error('Response:', error.response);
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Data:', error.response.data);
        }

        res.status(500).json({ error: error.message });
    }
}

module.exports = createThread;

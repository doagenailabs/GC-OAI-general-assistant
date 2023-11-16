const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: apiKey
});

async function deleteThread(req, res) {
    const { threadId } = req.body;
    console.log('Deleting thread:', threadId);

    try {
        const response = await openai.beta.threads.del(threadId);
        console.log('Thread deleted:', threadId);
        console.log(response);

        res.json({ message: 'Thread deleted successfully', threadId: threadId });
    } catch (error) {
        console.error(`Error in deleteThread:`, error);

        if (error.response) {
            console.error('Response:', error.response);
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Data:', error.response.data);
        }

        res.status(500).json({ error: error.message });
    }
}

module.exports = deleteThread;

const OpenAI = require('openai');

// Retrieve the API key and Assistant ID from environment variables
const apiKey = process.env.OAI_API_KEY;
const assistantId = process.env.OPENAI_ASSISTANT_ID;

const openai = new OpenAI({
    apiKey: apiKey
});

async function runAssistant(req, res) {
    // Log request body
    console.log('Request body:', req.body);

    const { threadId, instructions } = req.body;

    // Log extracted variables
    console.log('Thread ID:', threadId);
    console.log('Instructions:', instructions);

    try {
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: assistantId,
            instructions: instructions
        });

        // Log the response from OpenAI
        console.log('OpenAI Response:', run);

        res.json(run);
    } catch (error) {
        // Log error details
        console.error(`Error in runAssistant:`, error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = runAssistant;

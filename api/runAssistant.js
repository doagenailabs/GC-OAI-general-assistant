const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY;
const assistantId = process.env.OPENAI_ASSISTANT_ID;

const openai = new OpenAI({
    apiKey: apiKey
});

async function runAssistant(req, res) {
    const { threadId, instructions } = req.body;

    try {
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: assistantId,
            instructions: instructions
        });

        // Don't send sensitive information to client-side
        delete run.instructions;
        delete run.model;

        res.json(run);
    } catch (error) {
        console.error(`Error in runAssistant:`, error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = runAssistant;

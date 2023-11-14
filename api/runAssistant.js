const OpenAI = require('openai');

const apiKey = process.env.OAI_API_KEY;
const assistantId = process.env.OPENAI_ASSISTANT_ID;

const openai = new OpenAI({
    apiKey: apiKey,
    assistantId: assistantId
});

async function runAssistant(req, res) {
    const { threadId, assistantId, instructions } = req.body;

    try {
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: assistantId,
            instructions: instructions
        });
        res.json(run);
    } catch (error) {
        console.error(`Error in runAssistant:`, error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = runAssistant;

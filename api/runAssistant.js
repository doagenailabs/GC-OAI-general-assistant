const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OAIApiKey
});

async function runAssistant(threadId, assistantId, instructions) {
    try {
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: assistantId,
            instructions: instructions
        });
        return run;
    } catch (error) {
        console.error(`Error in runAssistant:`, error.toString());
        throw error;
    }
}

module.exports = runAssistant;

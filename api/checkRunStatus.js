const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OAIApiKey
});

async function checkRunStatus(threadId, runId) {
    try {
        const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
        return runStatus;
    } catch (error) {
        console.error(`Error in checkRunStatus:`, error.toString());
        throw error;
    }
}

module.exports = checkRunStatus;

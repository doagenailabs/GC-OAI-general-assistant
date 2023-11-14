const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OAIApiKey
});

async function checkRunStatus(req, res) {
    const { threadId, runId } = req.query;

    try {
        const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
        res.json(runStatus);
    } catch (error) {
        console.error(`Error in checkRunStatus:`, error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = checkRunStatus;

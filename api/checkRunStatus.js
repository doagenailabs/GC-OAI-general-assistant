const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: apiKey
});

async function checkRunStatus(req, res) {
    const { threadId, runId } = req.query;

    try {
        const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

        // Don't send sensitive information to client-side
        delete runStatus.instructions;
        delete runStatus.model;
        delete runStatus.tools;

        res.json(runStatus);
    } catch (error) {
        console.error(`Error in checkRunStatus:`, error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = checkRunStatus;

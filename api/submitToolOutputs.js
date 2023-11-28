const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: apiKey
});

async function submitToolOutputs(req, res) {
    const { threadId, runId, tool_outputs } = req.body;

    // Ensure that outputs are strings
    const stringifiedToolOutputs = tool_outputs.map(output => ({
        ...output,
        output: JSON.stringify(output.output)
    }));

    console.log('Submitting tool outputs for thread:', threadId, 'and run:', runId);

    try {
        const response = await openai.beta.threads.runs.submitToolOutputs(threadId, runId, { tool_outputs: stringifiedToolOutputs });
        console.log('Tool outputs submitted:', response);

        res.json({ message: 'Tool outputs submitted successfully', threadId: threadId, runId: runId });
    } catch (error) {
        console.error(`Error in submitToolOutputs:`, error);

        if (error.response) {
            console.error('Response:', error.response);
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Data:', error.response.data);
        }

        res.status(500).json({ error: error.message });
    }
}

module.exports = submitToolOutputs;


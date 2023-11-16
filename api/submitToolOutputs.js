const OpenAI = require('openai');

const apiKey = process.env.OAI_API_KEY;
const openai = new OpenAI({
    apiKey: apiKey
});

async function submitToolOutputs(req, res) {
    const { threadId, runId, tool_outputs } = req.body;
    console.log('Submitting tool outputs for Thread ID:', threadId, 'and Run ID:', runId);

    try {
        // Here, you would typically process or log the tool outputs.
        // For the current use case, we are just logging the outputs.
        console.log('Tool outputs:', tool_outputs);

        // Since this is just an acknowledgement endpoint and doesn't need to send data back to OpenAI,
        // we simply return a success response.
        res.json({ message: 'Tool outputs submitted successfully', threadId: threadId, runId: runId });
    } catch (error) {
        console.error(`Error in submitToolOutputs:`, error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = submitToolOutputs;

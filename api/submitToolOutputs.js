const OpenAI = require('openai');

const apiKey = process.env.OAI_API_KEY;
const openai = new OpenAI({
    apiKey: apiKey
});

async function submitToolOutputs(req, res) {
    console.log('Received request in submitToolOutputs:', req.body);

    const { threadId, runId, tool_outputs } = req.body;

    console.log('Thread ID:', threadId, 'Run ID:', runId, 'Tool Outputs:', tool_outputs);

    if (!threadId || !runId) {
        console.error('Thread ID or Run ID is undefined.');
        return res.status(400).json({ error: 'Thread ID or Run ID is undefined.' });
    }

    try {
        let responseMessages = [];
        for (const output of tool_outputs) {
            const outputMessage = constructOutputMessage(output);
            console.log('Sending message to thread:', outputMessage);

            const message = await openai.beta.threads.messages.create(threadId, {
                role: "user",
                content: outputMessage
            });

            console.log('Message sent to thread:', message);
            responseMessages.push(message);
        }

        res.json({ message: 'Tool outputs submitted and responses sent to assistant', threadId: threadId, runId: runId, responses: responseMessages });
    } catch (error) {
        console.error(`Error in submitToolOutputs:`, error);
        res.status(500).json({ error: error.message });
    }
}

function constructOutputMessage(output) {
    const message = `Function ${output.tool_call_id} completed with result: ${output.output}`;
    return message;
}

module.exports = submitToolOutputs;

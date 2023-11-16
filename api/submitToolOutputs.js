const OpenAI = require('openai');

const model = process.env.OPENAI_MODEL;
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
        // Construct messages based on tool outputs
        let toolResponseMessages = tool_outputs.map(output => ({
            role: "tool",
            name: output.tool_call_id,
            content: constructOutputMessage(output),
            tool_call_id: output.tool_call_id
        }));

        // Send the function responses back to the model
        const response = await openai.chat.completions.create({
            model: model,
            messages: toolResponseMessages,
            thread_id: threadId
        });

        res.json({ message: 'Function outputs submitted and response received from assistant', response: response.data });
    } catch (error) {
        console.error(`Error in submitToolOutputs:`, error);
        res.status(500).json({ error: error.message });
    }
}

function constructOutputMessage(output) {
    // Construct a message based on tool output
    const message = JSON.stringify({ result: output.output });
    return message;
}

module.exports = submitToolOutputs;

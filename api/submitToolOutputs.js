const OpenAI = require('openai');

const apiKey = process.env.OAI_API_KEY;
const openai = new OpenAI({
    apiKey: apiKey
});

async function submitToolOutputs(req, res) {
    const { threadId, runId, tool_outputs } = req.body;
    console.log('Submitting tool outputs for Thread ID:', threadId, 'and Run ID:', runId);

    try {
        // Process the tool outputs and construct a message to send back to the assistant
        let responseMessages = [];
        for (const output of tool_outputs) {
            const outputMessage = constructOutputMessage(output); // Function to construct a message from the tool output
            const message = await openai.beta.threads.messages.create(threadId, {
                role: "user",
                content: outputMessage
            });
            responseMessages.push(message);
        }

        // Respond with the messages that were sent to the assistant
        res.json({ message: 'Tool outputs submitted and responses sent to assistant', threadId: threadId, runId: runId, responses: responseMessages });
    } catch (error) {
        console.error(`Error in submitToolOutputs:`, error);
        res.status(500).json({ error: error.message });
    }
}

// Helper function to construct a message based on tool output
function constructOutputMessage(output) {
    // Depending on the output structure, create a message
    // This is a placeholder; customize this based on how your tool outputs are structured
    const message = `Function ${output.tool_call_id} completed with result: ${output.output}`;
    return message;
}

module.exports = submitToolOutputs;

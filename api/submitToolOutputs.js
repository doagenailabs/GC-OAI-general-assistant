const OpenAI = require('openai');
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL;
const openai = new OpenAI({ apiKey: apiKey });

async function submitToolOutputs(req, res) {
    console.log('Received request in submitToolOutputs:', req.body);
    const { threadId, tool_outputs } = req.body;

    if (!threadId) {
        console.error('Thread ID is undefined.');
        return res.status(400).json({ error: 'Thread ID is undefined.' });
    }

    try {
        // Retrieve the existing messages from the thread
        const threadMessagesResponse = await openai.beta.threads.messages.list(threadId);
        let originalMessages = threadMessagesResponse.data;

        // Filter and reformat existing messages
        let reformattedMessages = originalMessages.map(msg => ({
            role: msg.role,
            content: msg.content[0].type === 'text' ? msg.content[0].text.value : ''
        }));

        // Update the corresponding tool call message with the outcome
        tool_outputs.forEach(output => {
            const toolCallIndex = reformattedMessages.findIndex(msg => msg.role === 'tool' && msg.content.includes(output.tool_call_id));
            if (toolCallIndex !== -1) {
                reformattedMessages[toolCallIndex].content = constructOutputMessage(output);
            }
        });

        // Send the updated conversation to the model
        const response = await openai.chat.completions.create({
            model: model,
            messages: reformattedMessages
        });

        res.json({ message: 'Function outputs submitted and response received from assistant', response: response.data });
    } catch (error) {
        console.error(`Error in submitToolOutputs:`, error);
        res.status(500).json({ error: error.message });
    }
}

function constructOutputMessage(output) {
    // Include the result of the tool action in a format that the model can interpret
    return `Action completed: ${output.output}`;
}

module.exports = submitToolOutputs;

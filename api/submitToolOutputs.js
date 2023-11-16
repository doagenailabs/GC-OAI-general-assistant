const OpenAI = require('openai');
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL;
const openai = new OpenAI({ apiKey: apiKey });

async function submitToolOutputs(req, res) {
    console.log('Received request in submitToolOutputs:', req.body);
    const { threadId, tool_outputs, resultMessage } = req.body;

    if (!threadId) {
        console.error('Thread ID is undefined.');
        return res.status(400).json({ error: 'Thread ID is undefined.' });
    }

    try {
        const threadMessagesResponse = await openai.beta.threads.messages.list(threadId);
        let originalMessages = threadMessagesResponse.data;

        let reformattedMessages = originalMessages.map(msg => ({
            role: msg.role,
            content: msg.content[0].type === 'text' ? msg.content[0].text.value : ''
        }));

        // Log original messages
        console.log('Original messages:', reformattedMessages);

        tool_outputs.forEach(output => {
            // Find the index of the tool call in the conversation
            const toolCallIndex = reformattedMessages.findIndex(msg => msg.content.includes(output.tool_call_id));
            if (toolCallIndex !== -1) {
                // Construct the tool response
                const toolResponseMessage = {
                    role: "tool",
                    content: `Action completed: ${resultMessage || output.output}`,
                    // Add tool_call_id to link the response to the original call
                    tool_call_id: output.tool_call_id
                };
                // Insert the tool response after the tool call
                reformattedMessages.splice(toolCallIndex + 1, 0, toolResponseMessage);
            }
        });

        // Log reformatted messages with tool responses
        console.log('Reformatted messages with tool responses:', reformattedMessages);

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

module.exports = submitToolOutputs;

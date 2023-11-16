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
        const threadMessagesResponse = await openai.beta.threads.messages.list(threadId);
        let originalMessages = threadMessagesResponse.data;

        let reformattedMessages = originalMessages.map(msg => ({
            role: msg.role,
            content: msg.content[0].type === 'text' ? msg.content[0].text.value : ''
        }));

        console.log('Original messages:', reformattedMessages); // Log the original messages

        // Insert the tool responses at the correct positions in the conversation
        tool_outputs.forEach(output => {
            const toolCallIndex = reformattedMessages.findIndex(msg => msg.content.includes(output.tool_call_id));
            if (toolCallIndex !== -1) {
                const toolResponseMessage = {
                    role: "tool",
                    content: constructOutputMessage(output)
                };
                reformattedMessages.splice(toolCallIndex + 1, 0, toolResponseMessage);
            }
        });

        console.log('Reformatted messages with tool responses:', reformattedMessages); // Log the messages after adding tool responses

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
    return `Action completed: ${output.output}`;
}

module.exports = submitToolOutputs;

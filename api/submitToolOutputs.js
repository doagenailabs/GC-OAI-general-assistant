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

        // Reformat existing messages
        let reformattedMessages = originalMessages.map(msg => ({
            role: msg.role,
            content: msg.content[0].type === 'text' ? msg.content[0].text.value : ''
        }));

        // Append tool outputs as new messages to the conversation
        tool_outputs.forEach(output => {
            reformattedMessages.push({
                role: "tool",
                content: constructOutputMessage(output),
                tool_call_id: output.tool_call_id // Linking the response to the tool call
            });
        });

        console.log('Sending updated messages:', reformattedMessages);

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
    // Construct a message that clearly indicates the completion of the tool action
    return `Action completed: ${output.output}`;
}

module.exports = submitToolOutputs;

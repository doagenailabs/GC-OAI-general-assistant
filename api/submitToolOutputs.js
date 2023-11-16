const model = process.env.OPENAI_MODEL;

const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
    apiKey: apiKey
});

async function submitToolOutputs(req, res) {
    console.log('Received request in submitToolOutputs:', req.body);

    const { threadId, tool_outputs } = req.body;

    if (!threadId) {
        console.error('Thread ID is undefined.');
        return res.status(400).json({ error: 'Thread ID is undefined.' });
    }

    try {
        // Retrieve the messages from the thread
        const threadMessagesResponse = await openai.beta.threads.messages.list(threadId);
        let originalMessages = threadMessagesResponse.data;

        // Reformat the messages to fit the expected format
        let reformattedMessages = originalMessages.map(msg => ({
            role: msg.role,
            content: msg.content[0].type === 'text' ? msg.content[0].text.value : ''
            // Include only 'role' and 'content' properties
        }));

        // Integrate tool outputs into the conversation
        for (const output of tool_outputs) {
            let insertPosition = reformattedMessages.findIndex(msg => msg.id === output.tool_call_id);
            if (insertPosition !== -1) {
                insertPosition++; // Insert after the tool call
                const toolResponseMessage = {
                    role: "tool",
                    content: constructOutputMessage(output)
                    // 'tool_call_id' is not included as it's not recognized by the API
                };
                reformattedMessages.splice(insertPosition, 0, toolResponseMessage); // Insert the tool response
            }
        }

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
    const message = JSON.stringify({ result: output.output });
    return message;
}

module.exports = submitToolOutputs;

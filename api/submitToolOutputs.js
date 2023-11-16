const OpenAI = require('openai');

const apiKey = process.env.OAI_API_KEY;
const openai = new OpenAI({ apiKey: apiKey });

async function submitToolOutputs(req, res) {
    console.log('Received request in submitToolOutputs:', req.body);

    const { threadId, tool_outputs } = req.body;
    console.log('Thread ID:', threadId, 'Tool Outputs:', tool_outputs);

    if (!threadId) {
        console.error('Thread ID is undefined.');
        return res.status(400).json({ error: 'Thread ID is undefined.' });
    }

    try {
        // Retrieve the existing thread
        const threadResponse = await openai.beta.threads.retrieve(threadId);
        let messages = threadResponse.data.messages;

        // Integrate tool outputs into the conversation
        for (const output of tool_outputs) {
            // Find the position to insert the tool response
            let insertPosition = messages.findIndex(msg => msg.id === output.tool_call_id);
            if (insertPosition !== -1) {
                insertPosition++; // Insert after the tool call
                const toolResponseMessage = {
                    role: "tool",
                    content: constructOutputMessage(output),
                    tool_call_id: output.tool_call_id
                };
                messages.splice(insertPosition, 0, toolResponseMessage); // Insert the tool response
            }
        }

        // Send the updated conversation to the model
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages: messages
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

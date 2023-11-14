const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OAIApiKey
});

async function handleThreadOperations(req, res) {
    try {
        const { operation, threadId, assistantId, message, messageId, metadata, runId, toolOutputs } = req.body;

        let response;
        switch (operation) {
            case 'createThread':
                response = await openai.beta.threads.create();
                break;
            case 'sendMessage':
                response = await openai.beta.threads.messages.create(threadId, {
                    role: "user",
                    content: message
                });
                break;
            case 'runAssistant':
                response = await openai.beta.threads.runs.create(threadId, { assistant_id: assistantId });
                break;
            case 'getAssistantResponse':
                response = await openai.beta.threads.runs.retrieve(threadId, runId);
                break;
            case 'retrieveThread':
                response = await openai.beta.threads.retrieve(threadId);
                break;
            case 'modifyThread':
                response = await openai.beta.threads.update(threadId, { metadata });
                break;
            case 'deleteThread':
                response = await openai.beta.threads.del(threadId);
                break;
            case 'retrieveMessage':
                response = await openai.beta.threads.messages.retrieve(threadId, messageId);
                break;
            case 'modifyMessage':
                response = await openai.beta.threads.messages.update(threadId, messageId, { metadata });
                break;
            case 'listMessages':
                response = await openai.beta.threads.messages.list(threadId);
                break;
            case 'listRuns':
                response = await openai.beta.threads.runs.list(threadId);
                break;
            case 'modifyRun':
                response = await openai.beta.threads.runs.update(threadId, runId, { metadata });
                break;
            case 'submitToolOutputsToRun':
                response = await openai.beta.threads.runs.submitToolOutputs(threadId, runId, { tool_outputs: toolOutputs });
                break;
            case 'createThreadAndRun':
                response = await openai.beta.threads.createAndRun({
                    assistant_id: assistantId,
                    thread: { messages: message }
                });
                break;
            default:
                throw new Error('Invalid operation');
        }

        console.log("Operation:", operation, "Response:", response);
        res.json(response);
    } catch (error) {
        console.error(`Error in handleThreadOperations:`, error.toString());
        res.status(500).json({ error: 'An error occurred while processing the thread operation', details: error.toString() });
    }
}

module.exports = { handleThreadOperations };

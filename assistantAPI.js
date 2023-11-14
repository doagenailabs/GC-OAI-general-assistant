const { Configuration, OpenAIApi } = require('openai');

const apiKey = process.env.OAIApiKey;
const assistantID = process.env.AssistantID;
const configuration = new Configuration({ apiKey });
const openai = new OpenAIApi(configuration);

async function createThread() {
    const response = await openai.createChat({
        assistant_id: assistantID
    });
    return response.data;
}

async function sendMessage(threadId, message) {
    const response = await openai.createChatMessage({
        chat_id: threadId,
        role: "user",
        content: message
    });
    return response.data;
}

async function runAssistant(threadId) {
    const response = await openai.createChatRun({
        chat_id: threadId
    });
    return response.data;
}

async function getAssistantResponse(threadId, runId) {
    const response = await openai.getChatRun({
        chat_id: threadId,
        run_id: runId
    });
    return response.data;
}

module.exports = {
    createThread,
    sendMessage,
    runAssistant,
    getAssistantResponse
};

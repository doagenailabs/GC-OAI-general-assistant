const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OAIApiKey
});

async function createThread() {
    const emptyThread = await openai.beta.threads.create();
    return emptyThread;
}

async function sendMessage(threadId, message) {
    const threadMessages = await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: message
    });
    return threadMessages;
}

async function runAssistant(threadId, assistantId) {
    const run = await openai.beta.threads.runs.create(threadId, { assistant_id: assistantId });
    return run;
}

async function getAssistantResponse(threadId, runId) {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    return run;
}

async function retrieveThread(threadId) {
    const myThread = await openai.beta.threads.retrieve(threadId);
    return myThread;
}

async function modifyThread(threadId, metadata) {
    const updatedThread = await openai.beta.threads.update(threadId, { metadata });
    return updatedThread;
}

async function deleteThread(threadId) {
    const response = await openai.beta.threads.del(threadId);
    return response;
}

async function retrieveMessage(threadId, messageId) {
    const message = await openai.beta.threads.messages.retrieve(threadId, messageId);
    return message;
}

async function modifyMessage(threadId, messageId, metadata) {
    const updatedMessage = await openai.beta.threads.messages.update(threadId, messageId, { metadata });
    return updatedMessage;
}

async function listMessages(threadId) {
    const threadMessages = await openai.beta.threads.messages.list(threadId);
    return threadMessages.data;
}

async function listRuns(threadId) {
    const runs = await openai.beta.threads.runs.list(threadId);
    return runs;
}

async function modifyRun(threadId, runId, metadata) {
    const updatedRun = await openai.beta.threads.runs.update(threadId, runId, { metadata });
    return updatedRun;
}

async function submitToolOutputsToRun(threadId, runId, toolOutputs) {
    const run = await openai.beta.threads.runs.submitToolOutputs(threadId, runId, { tool_outputs: toolOutputs });
    return run;
}

async function createThreadAndRun(assistantId, messages) {
    const run = await openai.beta.threads.createAndRun({
        assistant_id: assistantId,
        thread: { messages }
    });
    return run;
}

module.exports = {
    createThread,
    sendMessage,
    runAssistant,
    getAssistantResponse,
    retrieveThread,
    modifyThread,
    deleteThread,
    retrieveMessage,
    modifyMessage,
    listMessages,
    listRuns,
    modifyRun,
    submitToolOutputsToRun,
    createThreadAndRun
};

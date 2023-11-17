const OpenAI = require('openai');
const fs = require('fs');

async function fetchWrapper(...args) {
    const { default: fetch } = await import('node-fetch');
    return fetch(...args);
}

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: apiKey
});

async function addMessageToThread(req, res) {
    const { threadId, messageContent, fileId } = req.body;

    try {
        let messageOptions = {
            role: "user",
            content: messageContent
        };
        if (fileId) {
            messageOptions.file_ids = [fileId];
        }

        const message = await openai.beta.threads.messages.create(threadId, messageOptions);
        res.json(message);
    } catch (error) {
        console.error(`Error in addMessageToThread:`, error);
        res.status(500).json({ error: error.message });
    }
}

async function uploadFile(req, res) {
    try {
        const fileStream = fs.createReadStream(req.file.path);
        const response = await fetchWrapper('https://api.openai.com/v1/files', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file: fileStream,
                purpose: "assistants",
            })
        });

        const result = await response.json();
        res.json({ fileId: result.id });
    } catch (error) {
        console.error('Error in uploadFile:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { addMessageToThread, uploadFile };

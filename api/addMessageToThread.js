const OpenAI = require('openai');
const fetch = require('node-fetch');
const fs = require('fs');

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
        const file = await openai.files.create({
            file: fileStream,
            purpose: "assistants",
        });

        res.json({ fileId: file.id });
    } catch (error) {
        console.error('Error in uploadFile:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { addMessageToThread, uploadFile };

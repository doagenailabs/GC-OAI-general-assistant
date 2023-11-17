const OpenAI = require('openai');
const fs = require('fs');

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: apiKey
});

async function uploadFile(req, res) {
    try {
        // Ensure the file is attached in the request and available under req.file
        // This requires file handling middleware like multer to be configured correctly
        if (!req.file) {
            res.status(400).send('No file uploaded.');
            return;
        }

        const fileStream = fs.createReadStream(req.file.path);
        const fileResponse = await openai.files.create({
            file: fileStream,
            purpose: "assistants"
        });

        res.json({ fileId: fileResponse.id });
    } catch (error) {
        console.error('Error in uploadFile:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = uploadFile;

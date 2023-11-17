const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: apiKey });

async function uploadFile(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let uploadedFile = req.files.file;
    let tempPath = path.join(__dirname, 'uploads', uploadedFile.name);
    
    // Save file temporarily
    await uploadedFile.mv(tempPath);

    try {
        const file = await openai.files.create({
            file: fs.createReadStream(tempPath),
            purpose: "assistants",
        });

        // Delete the temporary file
        fs.unlinkSync(tempPath);

        res.json({ file_id: file.id });
    } catch (error) {
        console.error(`Error in uploadFile:`, error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = uploadFile;

const OpenAI = require('openai');
const fs = require('fs');
const multer = require('multer');

const apiKey = process.env.OPENAI_API_KEY;
const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({
    apiKey: apiKey
});

module.exports = async (req, res) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            res.status(500).send(`Multer error: ${err}`);
            return;
        }

        if (!req.file) {
            res.status(400).send('No file uploaded.');
            return;
        }

        try {
            const fileStream = fs.createReadStream(req.file.path);
            const fileResponse = await openai.files.create({
                file: fileStream,
                purpose: "assistants"
            });

            // Clean up the uploaded file
            fs.unlink(req.file.path, (err) => {
                if (err) console.error(`Error deleting file: ${err}`);
            });

            res.json({ fileId: fileResponse.id });
        } catch (error) {
            console.error('Error in uploadFile:', error);
            res.status(500).json({ error: error.message });
        }
    });
};

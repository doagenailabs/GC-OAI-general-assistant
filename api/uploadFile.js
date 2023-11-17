const multiparty = require('multiparty');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: apiKey });

module.exports = (req, res) => {
    if (req.method === "POST") {
        let form = new multiparty.Form();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form:', err);
                res.status(500).send('Error parsing form data');
                return;
            }

            if (!files || !files.file) {
                console.error('No files were uploaded in the request');
                res.status(400).send('No files were uploaded.');
                return;
            }

            let uploadedFile = files.file[0];
            console.log('Received file for upload:', uploadedFile.originalFilename);

            try {
                console.log('Uploading file to OpenAI:', uploadedFile.originalFilename);
                const file = await openai.files.create({
                    file: fs.createReadStream(uploadedFile.path),
                    purpose: "assistants",
                });

                console.log('File uploaded to OpenAI successfully:', uploadedFile.originalFilename);
                // Delete the temporary file
                fs.unlinkSync(uploadedFile.path);

                res.json({ file_id: file.id });
            } catch (error) {
                console.error(`Error in uploadFile while uploading to OpenAI:`, error);
                fs.unlinkSync(uploadedFile.path); // Ensure to delete temporary file in case of error
                res.status(500).json({ error: error.message });
            }
        });
    } else {
        res.status(405).send("Method not allowed");
    }
};

module.exports = uploadFile;

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Import environment variables
const apiKey = process.env.OPENAI_API_KEY;
const visionModel = process.env.OPENAI_VISION_MODEL;

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: apiKey
});

// Function to encode the image to base64
function encodeImage(imagePath) {
    return fs.readFileSync(imagePath, { encoding: 'base64' });
}

// Function to handle vision API requests
async function runVision(req, res) {
    const { imageFilePath } = req.body;

    // Check if the image file exists
    if (!fs.existsSync(imageFilePath)) {
        return res.status(404).json({ error: 'Image file not found' });
    }

    // Encode the image to base64
    const imageBase64 = encodeImage(imageFilePath);
    const imageUrl = `data:image/jpeg;base64,${imageBase64}`;
    const userMessage = "What's in the image?"
    const systemMessage = "The image contains a contact center flow to serve customers. Describe with most accuracy possible the process in the flow. The words you produce will be used by another LLM as input for another task.";
    

    try {
        const response = await openai.chat.completions.create({
            model: visionModel,
            messages: [
                {
                    role: "user",
                    content: [{ type: "text", text: userMessage }]
                },
                {
                    role: "system",
                    content: [
                        { type: "text", text: systemMessage }
                    ]
                },
                {
                    role: "user",
                    content: [{ type: "image_url", image_url: { url: imageUrl } }]
                }
            ],
            max_tokens: 300
        });

        res.json(response);
    } catch (error) {
        console.error(`Error in runVision:`, error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = runVision;

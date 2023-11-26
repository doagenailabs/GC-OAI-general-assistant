const OpenAI = require('openai');

// Importing environment variables for different OpenAI assistants
const apiKey = process.env.OPENAI_API_KEY;
const groupAssistantId = process.env.OPENAI_GROUP_ASSISTANT_ID;
const queueAssistantId = process.env.OPENAI_QUEUE_ASSISTANT_ID;
const userAssistantId = process.env.OPENAI_USER_ASSISTANT_ID;
const triggersAssistantId = process.env.OPENAI_TRIGGER_ASSISTANT_ID;
const analyticsAssistantId = process.env.OPENAI_ANALYTICS_ASSISTANT_ID;

const openai = new OpenAI({
    apiKey: apiKey
});

async function runAssistant(req, res) {
    const { threadId, instructions, assistantType } = req.body;

    // Determine the assistant ID based on the type
    let assistantId;
    switch (assistantType) {
        case 'groups':
            assistantId = groupAssistantId;
            break;
        case 'queues':
            assistantId = queueAssistantId;
            break;
        case 'users':
            assistantId = userAssistantId;
            break;
        case 'triggers':
            assistantId = triggersAssistantId;
            break;
        case 'analytics':
            assistantId = analyticsAssistantId;
            break;            
        default:
            // Default assistant ID if none is specified
            assistantId = groupAssistantId;
            break;
    }

    try {
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: assistantId,
            instructions: instructions
        });

        // Don't send sensitive information to client-side
        delete run.instructions;
        delete run.model;
        delete run.tools;

        res.json(run);
    } catch (error) {
        console.error(`Error in runAssistant:`, error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = runAssistant;

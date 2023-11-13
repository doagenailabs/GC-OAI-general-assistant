async function getConfig() {
    const response = await fetch('/api/getConfig');
    if (!response.ok) {
        throw new Error('Environment vars could not be retrieved');
    }
    return response.json();
}

async function createThread() {
    const config = await getConfig();
    const response = await fetch('https://api.openai.com/v1/beta/threads', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.OAIApiKey}`,
            'OpenAI-Beta': 'assistants=v1'
        }
    });
    if (!response.ok) {
        throw new Error('Failed to create thread');
    }
    return response.json();
}

async function sendMessage(threadId, message) {
    const config = await getConfig();
    const response = await fetch(`https://api.openai.com/v1/beta/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.OAIApiKey}`,
            'OpenAI-Beta': 'assistants=v1',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            role: "user",
            content: message
        })
    });
    if (!response.ok) {
        throw new Error('Failed to send message');
    }
    return response.json();
}

async function runAssistant(threadId) {
    const config = await getConfig();
    const response = await fetch(`https://api.openai.com/v1/beta/threads/${threadId}/runs`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.OAIApiKey}`,
            'OpenAI-Beta': 'assistants=v1',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            assistant_id: config.AssistantID,
        })
    });
    if (!response.ok) {
        throw new Error('Failed to run assistant');
    }
    return response.json();
}

async function getAssistantResponse(threadId, runId) {
    const config = await getConfig();
    const response = await fetch(`https://api.openai.com/v1/beta/threads/${threadId}/runs/${runId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${config.OAIApiKey}`,
            'OpenAI-Beta': 'assistants=v1'
        }
    });
    if (!response.ok) {
        throw new Error('Failed to get assistant response');
    }
    return response.json();
}

async function handleUserInput(userMessage) {
    try {
        const thread = await createThread();
        await sendMessage(thread.data.id, userMessage);
        const run = await runAssistant(thread.data.id);

        // Poll for the assistant's response
        let assistantResponse;
        do {
            assistantResponse = await getAssistantResponse(thread.data.id, run.data.id);
            // Implement a delay before polling again
            await new Promise(resolve => setTimeout(resolve, 1000));
        } while (assistantResponse.data.status !== 'completed');

        // Process the assistant's messages
        const messages = await fetch(`https://api.openai.com/v1/beta/threads/${thread.data.id}/messages`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${config.OAIApiKey}`,
                'OpenAI-Beta': 'assistants=v1'
            }
        }).then(response => response.json());

        messages.data.forEach(message => {
            if (message.role === "assistant") {
                // Display the assistant's message
                displayMessage(message.content);
            }
        });
    } catch (error) {
        console.error('Error interacting with OpenAI Assistant:', error);
    }
}

function displayMessage(message) {
    // Implement this function to display the message in your UI
}

document.getElementById('openai-send-button').addEventListener('click', () => {
    const inputElement = document.getElementById('openai-chat-input');
    const userMessage = inputElement.value;
    inputElement.value = '';
    handleUserInput(userMessage);
});

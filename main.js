async function getConfig() {
    const response = await fetch('/api/getConfig');
    if (!response.ok) {
        throw new Error('Environment vars could not be retrieved');
    }
    return response.json();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('send-button').addEventListener('click', () => {
        const inputElement = document.getElementById('chat-input');
        const userMessage = inputElement.value;
        inputElement.value = '';
        handleUserInput(userMessage);
    });
});

async function handleUserInput(userMessage) {
    try {
        const thread = await fetch('/api/createThread').then(response => response.json());
        await fetch('/api/sendMessage', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ threadId: thread.id, message: userMessage })
        });

        const run = await fetch('/api/runAssistant', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ threadId: thread.id })
        }).then(response => response.json());

        let assistantResponse;
        do {
            assistantResponse = await fetch(`/api/getAssistantResponse?threadId=${thread.id}&runId=${run.id}`)
                .then(response => response.json());
            await new Promise(resolve => setTimeout(resolve, 1000));
        } while (assistantResponse.status !== 'completed');

        const messages = await fetch(`/api/getMessages?threadId=${thread.id}`)
            .then(response => response.json());

        messages.forEach(message => {
            if (message.role === "assistant") {
                displayMessage(message.content);
            }
        });
    } catch (error) {
        console.error('Error interacting with OpenAI Assistant:', error);
    }
}

async function handleToolCalls(toolCalls, threadId, runId) {
    for (const call of toolCalls) {
        let resultMessage;
        switch (call.function.name) {
            case 'deleteGenesysGroup':
                const groupId = JSON.parse(call.function.arguments).groupId;
                resultMessage = await deleteGenesysGroup(groupId);
                displayMessage(resultMessage);
                break;
            // Add cases for other functions as needed
        }
    }

    const outputs = toolCalls.map(call => ({ tool_call_id: call.id, output: "Completed" }));
    await fetch(`/api/submitToolOutputs?threadId=${threadId}&runId=${runId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ tool_outputs: outputs })
    });
}

function displayMessage(message) {
    const chatWindow = document.getElementById('chat-window');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatWindow.appendChild(messageElement);
}

async function deleteGenesysGroup(groupId) {
    try {
        const response = await fetch(`/api/deleteGenesysGroup?groupId=${groupId}`);
        const result = await response.json();
        return result.message;
    } catch (error) {
        console.error('Error in deleteGenesysGroup:', error);
        return "Failed to delete group.";
    }
}

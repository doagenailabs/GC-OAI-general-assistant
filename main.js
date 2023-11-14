async function handleUserInput(userMessage) {
    try {
        // Create a Thread
        const thread = await fetch('/api/createThread').then(response => response.json());

        // Add a Message to a Thread
        await fetch('/api/addMessageToThread', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ threadId: thread.id, messageContent: userMessage })
        });

        // Run the Assistant
        const run = await fetch('/api/runAssistant', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ threadId: thread.id })
        }).then(response => response.json());

        let assistantResponse;
        do {
            // Check the Run status
            assistantResponse = await fetch(`/api/checkRunStatus?threadId=${thread.id}&runId=${run.id}`)
                .then(response => response.json());
            await new Promise(resolve => setTimeout(resolve, 1000));
        } while (assistantResponse.status !== 'completed');

        // Display the Assistant's Response
        const messages = await fetch(`/api/displayAssistantResponse?threadId=${thread.id}`)
            .then(response => response.json());

        messages.data.forEach(message => {
            if (message.role === "assistant") {
                displayMessage(message.content.text.value);
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

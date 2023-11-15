
async function handleUserInput(userMessage) {
    try {
        let threadId = localStorage.getItem('currentThreadId');

        if (!threadId) {
            // Create a Thread only if there isn't a current thread ID
            const thread = await fetch('/api/createThread').then(response => response.json());
            threadId = thread.id;
            localStorage.setItem('currentThreadId', threadId); // Store the thread ID in localStorage
            console.log('New Thread ID:', threadId);
        } else {
            console.log('Using existing Thread ID:', threadId);
        }

        // Add a Message to a Thread
        await fetch('/api/addMessageToThread', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ threadId: threadId, messageContent: userMessage })
        });

        // Run the Assistant
        const run = await fetch('/api/runAssistant', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ threadId: threadId })
        }).then(response => response.json());

        let assistantResponse;
        do {
            // Check the Run status
            assistantResponse = await fetch(`/api/checkRunStatus?threadId=${threadId}&runId=${run.id}`)
                .then(response => response.json());
            await new Promise(resolve => setTimeout(resolve, 1000));
        } while (assistantResponse.status !== 'completed');

        // Display the Assistant's Response
        const messages = await fetch(`/api/displayAssistantResponse?threadId=${threadId}`)
            .then(response => response.json());
        
        messages.data.forEach(message => {
            if (message.role === "assistant") {
                // Iterate over the content array to find the text type content
                message.content.forEach(contentPart => {
                    if (contentPart.type === "text") {
                        displayMessage(contentPart.text.value);
                    }
                });
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

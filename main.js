async function loadExistingThread() {
    const threadId = localStorage.getItem('currentThreadId');
    if (threadId) {
        try {
            const response = await fetch(`/api/displayAssistantResponse?threadId=${threadId}`);
            const messages = await response.json();

            const displayedMessageIds = new Set();
            messages.data.sort((a, b) => a.created_at - b.created_at).forEach(message => {
                if (!displayedMessageIds.has(message.id)) {
                    displayedMessageIds.add(message.id);
                    const isUserMessage = message.role === "user";
                    message.content.forEach(contentPart => {
                        if (contentPart.type === "text") {
                            displayMessage(contentPart.text.value, isUserMessage);
                        }
                    });
                }
            });
        } catch (error) {
            console.error('Error loading existing thread:', error);
        }
    }
}

async function handleUserInput(userMessage) {
    showLoadingIcon(true); 

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
        let run = await fetch('/api/runAssistant', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ threadId: threadId })
        }).then(response => response.json());

        let assistantResponse;
        do {
            // Check the Run status
            assistantResponse = await fetch(`/api/checkRunStatus?threadId=${threadId}&runId=${run.id}`)
                .then(response => response.json());

            // Handle 'requires_action' status
            if (assistantResponse.status === 'requires_action') {
                // Perform required actions and submit tool outputs
                await handleToolCalls(assistantResponse.required_action.submit_tool_outputs.tool_calls, threadId, run.id);
                // Update the run status after submitting tool outputs
                run = await fetch(`/api/checkRunStatus?threadId=${threadId}&runId=${run.id}`)
                    .then(response => response.json());
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        } while (assistantResponse.status !== 'completed');

        const messages = await fetch(`/api/displayAssistantResponse?threadId=${threadId}`)
            .then(response => response.json());
        
        const lastAssistantMessage = messages.data.filter(message => message.role === "assistant").shift();
        if (lastAssistantMessage) {
            lastAssistantMessage.content.forEach(contentPart => {
                if (contentPart.type === "text") {
                    displayMessage(contentPart.text.value, false); 
                }
            });
        }

        showLoadingIcon(false); 

    } catch (error) {
        console.error('Error interacting with OpenAI Assistant:', error);
        showLoadingIcon(false);
    }
}

function showLoadingIcon(show) {
    const loadingIcon = document.getElementById('loading-icon');
    if (loadingIcon) {
        loadingIcon.style.display = show ? 'flex' : 'none';
    }
}

function displayMessage(message, isUserMessage) {
    const chatWindow = document.getElementById('chat-window');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;

    // Swap the styles for user and assistant messages
    if (isUserMessage) {
        messageElement.classList.add('received-message');
    } else {
        messageElement.classList.add('sent-message');
    }

    chatWindow.appendChild(messageElement);
}

function handleUserMessage(userMessage) {
    displayMessage(userMessage, true); // true for user message
}

async function handleToolCalls(toolCalls, threadId, runId) {
    for (const call of toolCalls) {
        let resultMessage;
        switch (call.function.name) {
            case 'deleteGenesysGroup':
                const groupId = JSON.parse(call.function.arguments).groupId;
                resultMessage = await deleteGenesysGroup(groupId);
                displayMessage(resultMessage, false); // false for assistant message
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

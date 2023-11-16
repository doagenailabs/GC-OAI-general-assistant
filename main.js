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
            assistantResponse = await fetch(`/api/checkRunStatus?threadId=${threadId}&runId=${run.id}`)
                .then(response => response.json());

            if (assistantResponse.status === 'requires_action') {
                await handleToolCalls(assistantResponse.required_action.submit_tool_outputs.tool_calls, threadId, run.id);
                // Update the run status after submitting tool outputs
                run = await fetch(`/api/checkRunStatus?threadId=${threadId}&runId=${run.id}`)
                    .then(response => response.json());
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        } while (assistantResponse.status !== 'completed');

        const messages = await fetch(`/api/displayAssistantResponse?threadId=${threadId}`)
            .then(response => response.json());
        
        messages.data.filter(message => message.role === "assistant").forEach(lastAssistantMessage => {
            lastAssistantMessage.content.forEach(contentPart => {
                if (contentPart.type === "text") {
                    displayMessage(contentPart.text.value, false); 
                }
            });
        });

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

    if (isUserMessage) {
        messageElement.classList.add('received-message');
    } else {
        messageElement.classList.add('sent-message');
    }

    chatWindow.appendChild(messageElement);
}

function handleUserMessage(userMessage) {
    displayMessage(userMessage, true); 
}

async function handleToolCalls(toolCalls, threadId, runId) {
    for (const call of toolCalls) {
        if (executedFunctionCalls.has(call.id)) {
            continue; // Skip already executed function calls
        }

        let resultMessage;
        switch (call.function.name) {
            case 'deleteGenesysGroup':
                const groupId = JSON.parse(call.function.arguments).groupId;
                resultMessage = await deleteGenesysGroup(groupId);
                displayMessage(resultMessage, false);
                break;
            // Add cases for other functions as needed
        }

        executedFunctionCalls.add(call.id); // Mark this function call as executed
    }

    const outputs = toolCalls.map(call => ({ tool_call_id: call.id, output: "Completed" }));
    await fetch(`/api/submitToolOutputs?threadId=${threadId}&runId=${runId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ tool_outputs: outputs })
    });
}

async function deleteGenesysGroup(groupId) {
    if (!window.platformClient) {
        console.error("Platform client is not available");
        return "Platform client not available.";
    }

    let apiInstance = new window.platformClient.GroupsApi();

    try {
        await apiInstance.deleteGroup(groupId);
        console.log("Group deleted successfully.");
        return "Group deleted successfully.";
    } catch (error) {
        console.error('Error in deleteGenesysGroup:', error);
        return "Failed to delete group.";
    }
}

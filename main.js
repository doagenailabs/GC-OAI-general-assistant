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
            const thread = await fetch('/api/createThread').then(response => response.json());
            threadId = thread.id;
            localStorage.setItem('currentThreadId', threadId);
            console.log('New Thread ID:', threadId);
        } else {
            console.log('Using existing Thread ID:', threadId);
        }

        await fetch('/api/addMessageToThread', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ threadId: threadId, messageContent: userMessage })
        });

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
                run = await fetch(`/api/checkRunStatus?threadId=${threadId}&runId=${run.id}`)
                    .then(response => response.json());
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        } while (assistantResponse.status !== 'completed');

        const messages = await fetch(`/api/displayAssistantResponse?threadId=${threadId}`)
            .then(response => response.json());

        // Find the most recent assistant message
        const mostRecentAssistantMessage = messages.data
            .filter(message => message.role === "assistant")
            .reduce((latest, message) => (message.created_at > latest.created_at ? message : latest), messages.data[0]);

        mostRecentAssistantMessage.content.forEach(contentPart => {
            if (contentPart.type === "text") {
                displayMessage(contentPart.text.value, false);
            }
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

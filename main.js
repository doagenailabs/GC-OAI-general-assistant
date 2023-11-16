async function loadExistingThread() {
    console.log('Loading existing thread...');
    const threadId = localStorage.getItem('currentThreadId');
    console.log('Current thread ID:', threadId);

    if (threadId) {
        try {
            console.log('Fetching messages for thread:', threadId);
            const response = await fetch(`/api/displayAssistantResponse?threadId=${threadId}`);
            const messages = await response.json();

            const displayedMessageIds = new Set();
            console.log('Sorting and displaying messages...');
            messages.data.sort((a, b) => a.created_at - b.created_at).forEach(message => {
                if (!displayedMessageIds.has(message.id)) {
                    displayedMessageIds.add(message.id);
                    console.log('Displaying message:', message.id);
                    const isUserMessage = message.role === "user";
                    message.content.forEach(contentPart => {
                        if (contentPart.type === "text") {
                            displayMessage(contentPart.text.value, isUserMessage);
                        }
                    });
                } else {
                    console.log('Skipping already displayed message:', message.id);
                }
            });
        } catch (error) {
            console.error('Error loading existing thread:', error);
        }
    }
}

async function handleUserInput(userMessage) {
    console.log('Handling user input:', userMessage);
    showLoadingIcon(true);

    try {
        let threadId = localStorage.getItem('currentThreadId');
        console.log('Current thread ID:', threadId);

        if (!threadId) {
            console.log('Creating new thread...');
            const thread = await fetch('/api/createThread').then(response => response.json());
            threadId = thread.id;
            localStorage.setItem('currentThreadId', threadId);
            console.log('New Thread ID:', threadId);
        }

        console.log('Adding message to thread:', threadId);
        await fetch('/api/addMessageToThread', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ threadId: threadId, messageContent: userMessage })
        });

        console.log('Running assistant...');
        let run = await fetch('/api/runAssistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ threadId: threadId })
        }).then(response => response.json());

        let assistantResponse;
        do {
            console.log('Checking run status:', run.id);
            assistantResponse = await fetch(`/api/checkRunStatus?threadId=${threadId}&runId=${run.id}`)
                .then(response => response.json());

            if (assistantResponse.status === 'requires_action') {
                console.log('Handling tool calls...');
                await handleToolCalls(assistantResponse.required_action.submit_tool_outputs.tool_calls, threadId, run.id);
                run = await fetch(`/api/checkRunStatus?threadId=${threadId}&runId=${run.id}`)
                    .then(response => response.json());
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        } while (assistantResponse.status !== 'completed');

        console.log('Fetching display assistant response...');
        const messages = await fetch(`/api/displayAssistantResponse?threadId=${threadId}`)
            .then(response => response.json());

        console.log('Filtering and displaying new assistant messages...');
        messages.data.filter(message => message.role === "assistant" && (!window.lastAssistantMessageId || message.id > window.lastAssistantMessageId))
            .forEach(message => {
                window.lastAssistantMessageId = message.id;
                console.log('Displaying message:', message.id);
                message.content.forEach(contentPart => {
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

// Function to load existing thread and display messages
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

// Function to handle user input and initiate the process
async function handleUserInput(userMessage, file) {
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

        let fileID = null;
        if (file) {
            console.log('Uploading file:', file.name);
            const formData = new FormData();
            formData.append('file', file);
            const fileUploadResponse = await fetch('/api/uploadFile', {
                method: 'POST',
                body: formData
            });

            if (!fileUploadResponse.ok) {
                throw new Error(`File upload failed: ${fileUploadResponse.statusText}`);
            }

            const fileData = await fileUploadResponse.json();
            fileID = fileData.file_id;
            console.log('File uploaded successfully. File ID:', fileID);
        }

        const messageData = {
            threadId: threadId,
            messageContent: userMessage,
            fileID: fileID
        };

        console.log('Sending message with attached file ID (if any):', fileID);
        await fetch('/api/addMessageToThread', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(messageData)
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

            if (assistantResponse.status === 'failed') {
                console.error('Run failed:', assistantResponse.last_error);
                displayMessage('Sorry, something went wrong with processing your request.', false);
                break; // Exiting the loop on failure
            }

            if (assistantResponse.status === 'requires_action') {
                const toolCalls = assistantResponse.required_action.submit_tool_outputs.tool_calls;

                if (Array.isArray(toolCalls) && toolCalls.length > 0) {
                    await handleToolCalls(toolCalls, threadId, run.id);
                }

                run = await fetch(`/api/checkRunStatus?threadId=${threadId}&runId=${run.id}`)
                    .then(response => response.json());
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        } while (assistantResponse.status !== 'completed');

        const messages = await fetch(`/api/displayAssistantResponse?threadId=${threadId}`)
            .then(response => response.json());

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
        console.error('Error in handleUserInput:', error);
        showLoadingIcon(false);
    }
}

// Show or hide the loading icon
function showLoadingIcon(show) {
    const loadingIcon = document.getElementById('loading-icon');
    if (loadingIcon) {
        loadingIcon.style.display = show ? 'flex' : 'none';
    }
}

// Display a message in the chat window
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

// Function to display user message
function handleUserMessage(userMessage) {
    displayMessage(userMessage, true); 
}

// Function to delete a Genesys group
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

// Global variable to store the selected assistant ID
var selectedAssistantId = '';

// Function to set the assistant ID based on button click and show chat UI
function selectAssistantAndShowChat(assistantId) {
    selectedAssistantId = assistantId;
    document.getElementById('initial-ui').style.display = 'none';
    document.getElementById('chat-ui').style.display = 'block';
}

document.getElementById('btn-groups').addEventListener('click', function() { selectAssistantAndShowChat('OPENAI_GROUP_ASSISTANT_ID'); });
document.getElementById('btn-queues').addEventListener('click', function() { selectAssistantAndShowChat('OPENAI_QUEUE_ASSISTANT_ID'); });
document.getElementById('btn-users').addEventListener('click', function() { selectAssistantAndShowChat('OPENAI_USER_ASSISTANT_ID'); });

async function loadExistingThread() {
    const threadId = localStorage.getItem('currentThreadId');
    if (threadId) {
        try {
            const response = await fetch(`/api/displayAssistantResponse?threadId=${threadId}`);
            const messages = await response.json();

            // Sort messages by `created_at` in ascending order
            const sortedMessages = messages.data.sort((a, b) => a.created_at - b.created_at);

            const displayedMessageIds = new Set(); // Define the set to track displayed messages

            for (const message of sortedMessages) {
                if (!displayedMessageIds.has(message.id)) {
                    displayedMessageIds.add(message.id);
                    const isUserMessage = message.role === "user";
                    // Handle each part of the message content
                    for (const contentPart of message.content) {
                        if (contentPart.type === "text") {
                            const safeHTML = await sanitizeHTML(contentPart.text.value);
                            displayMessage(safeHTML, isUserMessage);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading existing thread:', error);
        }
    }
}

function displayMessage(message, isUserMessage) {
    const chatWindow = document.getElementById('chat-window');
    const messageElement = document.createElement('div');
    messageElement.innerHTML = message; 

    if (isUserMessage) {
        messageElement.classList.add('user-message');
    } else {
        messageElement.classList.add('assistant-message');
    }

    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    window.adjustElementStyles();
}

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
            body: JSON.stringify({ 
                threadId: threadId, 
                assistantType: window.selectedAssistantId
            })
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


function showLoadingIcon(show) {
    const loadingIcon = document.getElementById('loading-icon');
    if (loadingIcon) {
        loadingIcon.style.display = show ? 'flex' : 'none';
    }
}

async function sanitizeHTML(str) {
    try {
        const response = await fetch('/api/serverSanitizeHTML', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html: str })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.safeHTML;
    } catch (error) {
        console.error('Error during HTML sanitization', error);
        return ''; 
    }
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

window.adjustElementStyles = function() {
    const chatWindow = document.getElementById('chat-window');
    const chatWidth = chatWindow.clientWidth;

    const tables = chatWindow.getElementsByTagName('table');
    for (let table of tables) {
        table.style.maxWidth = `${chatWidth - 40}px`; // Adjust 40px for padding
        table.style.width = '100%';
        table.style.boxSizing = 'border-box';
    }

    // Additional adjustments for other elements can be added here
}

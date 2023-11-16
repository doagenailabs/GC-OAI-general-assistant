async function handleToolCalls(toolCalls, threadId, runId) {
    for (const call of toolCalls) {
        // Check if this tool call has already been handled
        if (localStorage.getItem(call.id) === 'completed') {
            continue; // Skip this call as it has already been handled
        }

        let resultMessage;
        switch (call.function.name) {
            case 'deleteGroup':
                const groupId = JSON.parse(call.function.arguments).groupId;
                resultMessage = await window.deleteGroup(groupId);
                displayMessage(resultMessage, false); // false for assistant message
                break;
            // Add cases for other functions as needed
        }

        const outputs = [{ tool_call_id: call.id, output: resultMessage || "Completed" }];
        
        // Send threadId and runId in the request body
        await fetch(`/api/submitToolOutputs`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ threadId: threadId, runId: runId, tool_outputs: outputs })
        });

        // Mark this tool call as completed to avoid reprocessing
        localStorage.setItem(call.id, 'completed');
    }
}

window.handleToolCalls = handleToolCalls;

async function handleToolCalls(toolCalls, threadId, runId) {
    for (const call of toolCalls) {
        let resultMessage;
        switch (call.function.name) {
            case 'deleteGroup':
                const groupId = JSON.parse(call.function.arguments).groupId;
                resultMessage = await window.deleteGroup(groupId);
                displayMessage(resultMessage, false); // false for assistant message
                break;
            // Add cases for other functions as needed
        }

        const outputs = toolCalls.map(call => ({ tool_call_id: call.id, output: "Completed" }));
        
        // Send threadId and runId in the request body
        await fetch(`/api/submitToolOutputs`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ threadId: threadId, runId: runId, tool_outputs: outputs })
        });
    }
}

window.handleToolCalls = handleToolCalls;

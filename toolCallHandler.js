async function handleToolCalls(toolCalls, threadId, runId) {
    for (const call of toolCalls) {
        if (localStorage.getItem(call.id) === 'completed') {
            continue;
        }

        let resultMessage;
        switch (call.function.name) {
            case 'deleteGroup':
                const groupId = JSON.parse(call.function.arguments).groupId;
                resultMessage = await window.deleteGroup(groupId);
                break;
            // Add cases for other functions as needed
        }

        const outputs = [{ tool_call_id: call.id, output: resultMessage || "Completed" }];

        // Send the result message, threadId, and runId in the request body
        await fetch(`/api/submitToolOutputs`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ threadId: threadId, runId: runId, tool_outputs: outputs, resultMessage: resultMessage })
        });

        localStorage.setItem(call.id, 'completed');
    }
}

window.handleToolCalls = handleToolCalls;

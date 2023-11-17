async function handleToolCalls(toolCalls, threadId, runId) {
    let toolOutputs = [];

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

        toolOutputs.push({ tool_call_id: call.id, output: resultMessage || "Completed" });
        localStorage.setItem(call.id, 'completed');
    }

    // Check if there are any tool outputs to submit
    if (toolOutputs.length > 0) {
        await fetch(`/api/submitToolOutputs`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ threadId: threadId, runId: runId, tool_outputs: toolOutputs })
        });
    }
}

window.handleToolCalls = handleToolCalls;

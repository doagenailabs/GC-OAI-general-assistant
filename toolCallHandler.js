async function handleToolCalls(toolCalls, threadId, runId) {
    const toolCallPromises = toolCalls.map(async (call) => {
        if (localStorage.getItem(call.id) === 'completed') {
            return null;
        }

        let resultMessage;
        switch (call.function.name) {
            case 'deleteGroup':
                const groupId = JSON.parse(call.function.arguments).groupId;
                resultMessage = await window.deleteGroup(groupId);
                break;
            case 'getQueueDetails':
                const queueIdForDetails = JSON.parse(call.function.arguments).queueId;
                resultMessage = await window.getQueueDetails(queueIdForDetails);
                break;
            case 'getEstimatedWaitTime':
                const argsWaitTime = JSON.parse(call.function.arguments);
                resultMessage = await window.getEstimatedWaitTime(argsWaitTime.queueId, argsWaitTime.mediaType);
                break;
            case 'getQueueMembers':
                const queueIdForMembers = JSON.parse(call.function.arguments).queueId;
                resultMessage = await window.getQueueMembers(queueIdForMembers);
                break;
            // Add cases for other functions as needed
        }

        localStorage.setItem(call.id, 'completed');
        return resultMessage ? { tool_call_id: call.id, output: resultMessage } : { tool_call_id: call.id, output: "Completed" };
    });

    const toolOutputs = (await Promise.all(toolCallPromises)).filter(output => output !== null);

    if (toolOutputs.length > 0) {
        await fetch(`/api/submitToolOutputs`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ threadId: threadId, runId: runId, tool_outputs: toolOutputs })
        });
    }
}

window.handleToolCalls = handleToolCalls;

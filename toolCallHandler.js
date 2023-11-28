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
            case 'getQueueMembers':
                const queueIdForMembers = JSON.parse(call.function.arguments).queueId;
                resultMessage = await window.getQueueMembers(queueIdForMembers);
                break;
            case 'getQueuesList':
                const options = JSON.parse(call.function.arguments);
                resultMessage = await window.getQueuesList(options);
                break;    
            case 'getEstimatedWaitTime':
                const argsForEstimatedWaitTime = JSON.parse(call.function.arguments);
                resultMessage = await window.getEstimatedWaitTime(argsForEstimatedWaitTime.queueId, argsForEstimatedWaitTime.conversationId);
                break;
            case 'searchUsers':
                const searchCriteria = JSON.parse(call.function.arguments).searchCriteria;
                resultMessage = await window.searchUsers(searchCriteria);
                break;
            case 'modifyQueueMembers':
                const argsForModifyQueueMembers = JSON.parse(call.function.arguments);
                resultMessage = await window.modifyQueueMembers(argsForModifyQueueMembers.queueId, argsForModifyQueueMembers.members, argsForModifyQueueMembers.isDelete);
                break;
            case 'handleConversationDetailJob':
                if (window.handleConversationDetailJob) {
                    const jobParams = JSON.parse(call.function.arguments);
                    resultMessage = await window.handleConversationDetailJob(jobParams);
                } else {
                    resultMessage = "handleConversationDetailJob function not found";
                }
                break;
            default:
                resultMessage = "Unknown function call";
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

async function handleToolCalls(toolCalls, threadId, runId) {
    console.log("handleToolCalls started"); // Log at the start

    const toolCallPromises = toolCalls.map(async (call) => {
        console.log("Processing tool call:", call.function.name); // Log each tool call being processed

        if (localStorage.getItem(call.id) === 'completed') {
            console.log("Call already completed:", call.id); // Log if the call is already completed
            return null;
        }

        let resultMessage;
        switch (call.function.name) {
            case 'deleteGroup':
                const groupId = JSON.parse(call.function.arguments).groupId;
                console.log("deleteGroup with groupId:", groupId); // Log inside each case
                resultMessage = await window.deleteGroup(groupId);
                break;
            case 'getQueueDetails':
                const queueIdForDetails = JSON.parse(call.function.arguments).queueId;
                console.log("getQueueDetails with queueId:", queueIdForDetails);
                resultMessage = await window.getQueueDetails(queueIdForDetails);
                break;
            case 'getQueueMembers':
                const queueIdForMembers = JSON.parse(call.function.arguments).queueId;
                console.log("getQueueMembers with queueId:", queueIdForMembers);
                resultMessage = await window.getQueueMembers(queueIdForMembers);
                break;
            case 'getQueuesList':
                const options = JSON.parse(call.function.arguments);
                console.log("getQueuesList with options:", options);
                resultMessage = await window.getQueuesList(options);
                break;    
            case 'getEstimatedWaitTime':
                const argsForEstimatedWaitTime = JSON.parse(call.function.arguments);
                console.log("getEstimatedWaitTime with args:", argsForEstimatedWaitTime);
                resultMessage = await window.getEstimatedWaitTime(argsForEstimatedWaitTime.queueId, argsForEstimatedWaitTime.conversationId);
                break;        
            case 'searchUsers':
                const searchCriteria = JSON.parse(call.function.arguments).searchCriteria;
                console.log("searchUsers with searchCriteria:", searchCriteria);
                resultMessage = await window.searchUsers(searchCriteria);
                break;
            case 'modifyQueueMembers':
                const argsForModifyQueueMembers = JSON.parse(call.function.arguments);
                console.log("modifyQueueMembers with args:", argsForModifyQueueMembers);
                resultMessage = await window.modifyQueueMembers(argsForModifyQueueMembers.queueId, argsForModifyQueueMembers.members, argsForModifyQueueMembers.isDelete);
                break;     
            // Add cases for other functions as needed
            default:
                console.log("Unknown function name:", call.function.name); // Log for an unknown function
        }

        localStorage.setItem(call.id, 'completed');
        console.log("Call completed and marked in localStorage:", call.id); // Log after marking a call as completed

        return resultMessage ? { tool_call_id: call.id, output: resultMessage } : { tool_call_id: call.id, output: "Completed" };
    });

    console.log("Awaiting promises from tool calls"); // Log before awaiting all promises
    const toolOutputs = (await Promise.all(toolCallPromises)).filter(output => output !== null);

    console.log("Tool outputs:", toolOutputs); // Log the tool outputs
    if (toolOutputs.length > 0) {
        console.log("Submitting tool outputs");
        await fetch(`/api/submitToolOutputs`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ threadId: threadId, runId: runId, tool_outputs: toolOutputs })
        });
        console.log("Tool outputs submitted"); // Log after submitting tool outputs
    }
}

window.handleToolCalls = handleToolCalls;
console.log("handleToolCalls function attached to window"); // Log after attaching function to window

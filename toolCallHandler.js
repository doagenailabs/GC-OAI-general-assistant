async function handleToolCalls(toolCalls, threadId, runId) {
    console.log("Starting to process tool calls");

    const toolCallPromises = toolCalls.map(async (call) => {
        if (localStorage.getItem(call.id) === 'completed') {
            console.log(`Tool call ${call.id} already completed, skipping`);
            return null;
        }

        console.log(`Processing tool call ${call.id}: ${call.function.name}`);
        let resultMessage;
        try {
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
                    const jobParams = JSON.parse(call.function.arguments);
                    console.log(`Executing handleConversationDetailJob with params: ${JSON.stringify(jobParams)}`);
                    resultMessage = await window.handleConversationDetailJob(jobParams);
                    break;
                default:
                    console.log(`Unknown function call: ${call.function.name}`);
                    resultMessage = "Unknown function call";
            }

            console.log(`Tool call ${call.id} completed with result: ${resultMessage}`);
        } catch (error) {
            console.error(`Error processing tool call ${call.id}:`, error);
            resultMessage = `Error: ${error.message}`;
        }

        localStorage.setItem(call.id, 'completed');
        return resultMessage ? { tool_call_id: call.id, output: resultMessage } : { tool_call_id: call.id, output: "Completed" };
    });

    const toolOutputs = (await Promise.all(toolCallPromises)).filter(output => output !== null);
    console.log(`Finished processing tool calls, submitting outputs: ${JSON.stringify(toolOutputs)}`);

    if (toolOutputs.length > 0) {
        try {
            const response = await fetch(`/api/submitToolOutputs`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ threadId: threadId, runId: runId, tool_outputs: toolOutputs })
            });
            console.log(`Tool outputs submitted successfully, response: ${JSON.stringify(response)}`);
        } catch (error) {
            console.error(`Error submitting tool outputs:`, error);
        }
    }
}

window.handleToolCalls = handleToolCalls;

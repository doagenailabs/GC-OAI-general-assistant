async function handleToolCalls(toolCalls, threadId, runId) {
    console.log("handleToolCalls - Starting to process tool calls", toolCalls);

    const toolCallPromises = toolCalls.map(async (call) => {
        console.log(`handleToolCalls - Processing tool call with ID: ${call.id} and name: ${call.function.name}`);

        if (localStorage.getItem(call.id) === 'completed') {
            console.log(`handleToolCalls - Tool call ${call.id} already completed, skipping`);
            return null;
        }

        let resultMessage;
        try {
            switch (call.function.name) {
                case 'deleteGroup':
                    const groupId = JSON.parse(call.function.arguments).groupId;
                    console.log(`handleToolCalls - Calling deleteGroup with groupId: ${groupId}`);
                    resultMessage = await window.deleteGroup(groupId);
                    break;
                case 'getQueueDetails':
                    const queueIdForDetails = JSON.parse(call.function.arguments).queueId;
                    console.log(`handleToolCalls - Calling getQueueDetails with queueId: ${queueIdForDetails}`);
                    resultMessage = await window.getQueueDetails(queueIdForDetails);
                    break;
                case 'getQueueMembers':
                    const queueIdForMembers = JSON.parse(call.function.arguments).queueId;
                    console.log(`handleToolCalls - Calling getQueueMembers with queueId: ${queueIdForMembers}`);
                    resultMessage = await window.getQueueMembers(queueIdForMembers);
                    break;
                case 'getQueuesList':
                    const options = JSON.parse(call.function.arguments);
                    console.log(`handleToolCalls - Calling getQueuesList with options:`, options);
                    resultMessage = await window.getQueuesList(options);
                    break;    
                case 'getEstimatedWaitTime':
                    const argsForEstimatedWaitTime = JSON.parse(call.function.arguments);
                    console.log(`handleToolCalls - Calling getEstimatedWaitTime with arguments:`, argsForEstimatedWaitTime);
                    resultMessage = await window.getEstimatedWaitTime(argsForEstimatedWaitTime.queueId, argsForEstimatedWaitTime.conversationId);
                    break;
                case 'searchUsers':
                    const searchCriteria = JSON.parse(call.function.arguments).searchCriteria;
                    console.log(`handleToolCalls - Calling searchUsers with searchCriteria:`, searchCriteria);
                    resultMessage = await window.searchUsers(searchCriteria);
                    break;
                case 'modifyQueueMembers':
                    const argsForModifyQueueMembers = JSON.parse(call.function.arguments);
                    console.log(`handleToolCalls - Calling modifyQueueMembers with arguments:`, argsForModifyQueueMembers);
                    resultMessage = await window.modifyQueueMembers(argsForModifyQueueMembers.queueId, argsForModifyQueueMembers.members, argsForModifyQueueMembers.isDelete);
                    break;
                case 'handleConversationDetailJob':
                    if (window.handleConversationDetailJob) {
                        const jobParams = JSON.parse(call.function.arguments);
                        console.log(`handleToolCalls - Executing handleConversationDetailJob with params:`, jobParams);
                        resultMessage = await window.handleConversationDetailJob(jobParams);
                    } else {
                        console.log("handleToolCalls - handleConversationDetailJob function not found in window");
                        resultMessage = "handleConversationDetailJob function not found";
                    }
                    break;
                default:
                    console.log(`handleToolCalls - Unknown function call: ${call.function.name}`);
                    resultMessage = "Unknown function call";
            }

            console.log(`handleToolCalls - Tool call ${call.id} completed. Result: ${resultMessage}`);
        } catch (error) {
            console.error(`handleToolCalls - Error processing tool call ${call.id}:`, error);
            resultMessage = `Error: ${error.message}`;
        }

        localStorage.setItem(call.id, 'completed');
        console.log(`handleToolCalls - Marked tool call ${call.id} as completed in localStorage`);
        return resultMessage ? { tool_call_id: call.id, output: resultMessage } : { tool_call_id: call.id, output: "Completed" };
    });

    console.log("handleToolCalls - Awaiting promises from tool calls");
    const toolOutputs = (await Promise.all(toolCallPromises)).filter(output => output !== null);
    console.log("handleToolCalls - Finished processing tool calls, Outputs:", toolOutputs);

    if (toolOutputs.length > 0) {
        console.log("handleToolCalls - Submitting tool outputs to API");
        try {
            const response = await fetch(`/api/submitToolOutputs`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ threadId: threadId, runId: runId, tool_outputs: toolOutputs })
            });
            console.log("handleToolCalls - Tool outputs submitted successfully. Response:", response);
        } catch (error) {
            console.error("handleToolCalls - Error submitting tool outputs:", error);
        }
    }
}

window.handleToolCalls = handleToolCalls;

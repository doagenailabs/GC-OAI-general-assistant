async function handleToolCalls(toolCalls, threadId, runId) {
    console.log('handleToolCalls started', { toolCalls, threadId, runId });

    const toolCallPromises = toolCalls.map(async (call) => {
        console.log('Processing tool call', call);

        if (localStorage.getItem(call.id) === 'completed') {
            console.log('Tool call already completed', call.id);
            return null;
        }

        let resultMessage;
        try {
            switch (call.function.name) {
                case 'deleteGroup':
                    const groupId = JSON.parse(call.function.arguments).groupId;
                    resultMessage = await window.deleteGroup(groupId);
                    break;
                // ... include other cases here
                default:
                    console.log('No matching function found for tool call', call.function.name);
            }
        } catch (error) {
            console.error('Error in processing tool call', call.function.name, error);
            return { tool_call_id: call.id, output: "Error occurred" };
        }

        localStorage.setItem(call.id, 'completed');
        console.log('Tool call processed', { tool_call_id: call.id, resultMessage });
        return resultMessage ? { tool_call_id: call.id, output: resultMessage } : { tool_call_id: call.id, output: "Completed" };
    });

    const toolOutputs = (await Promise.all(toolCallPromises)).filter(output => output !== null);
    console.log('Tool calls outputs', toolOutputs);

    if (toolOutputs.length > 0) {
        try {
            await fetch(`/api/submitToolOutputs`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ threadId: threadId, runId: runId, tool_outputs: toolOutputs })
            });
            console.log('Tool outputs submitted successfully');
        } catch (error) {
            console.error('Error in submitting tool outputs', error);
        }
    }
}

window.handleToolCalls = handleToolCalls;
console.log('handleToolCalls function set on window');

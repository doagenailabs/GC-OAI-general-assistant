async function deleteGroup(groupId) {
    if (!window.platformClient) {
        console.error("Platform client is not available");
        return "Error at group deletion";
    }

    let apiInstance = new window.platformClient.GroupsApi();

    try {
        await apiInstance.deleteGroup(groupId);
        console.log("Group deleted successfully.");
        return "Group deleted successfully";
    } catch (error) {
        console.error('Error in deleteGroup:', error);
        return "Error at group deletion";
    }
}

// Attach the function to the global window object
window.deleteGroup = deleteGroup;

async function getQueueDetails(queueId) {
    if (!window.platformClient) {
        console.error("Platform client is not available");
        return "Error accessing platform client";
    }

    let apiInstance = new window.platformClient.RoutingApi();

    try {
        let queueDetails = await apiInstance.getRoutingQueue(queueId);
        console.log("Queue details retrieved successfully.");
        return JSON.stringify(queueDetails);
    } catch (error) {
        console.error('Error in getQueueDetails:', error);
        return `Error retrieving queue details: ${error.message}`;
    }
}

window.getQueueDetails = getQueueDetails;

async function getEstimatedWaitTime(queueId, mediaType) {
    if (!window.platformClient) {
        console.error("Platform client is not available");
        return "Error accessing platform client";
    }

    let apiInstance = new window.platformClient.RoutingApi();

    try {
        let waitTime = await apiInstance.getRoutingQueueMediatypesEstimatedwaittime(queueId, mediaType);
        console.log("Estimated wait time retrieved successfully.");
        return JSON.stringify(waitTime);
    } catch (error) {
        console.error('Error in getEstimatedWaitTime:', error);
        return `Error retrieving estimated wait time: ${error.message}`;
    }
}

window.getEstimatedWaitTime = getEstimatedWaitTime;

async function getQueueMembers(queueId) {
    if (!window.platformClient) {
        console.error("Platform client is not available");
        return "Error accessing platform client";
    }

    let apiInstance = new window.platformClient.RoutingApi();

    try {
        let members = await apiInstance.getRoutingQueueMembers(queueId);
        console.log("Queue members retrieved successfully.");
        return JSON.stringify(members);
    } catch (error) {
        console.error('Error in getQueueMembers:', error);
        return `Error retrieving queue members: ${error.message}`;
    }
}

window.getQueueMembers = getQueueMembers;

async function getQueuesList(opts) {
    if (!window.platformClient) {
        console.error("Platform client is not available");
        return "Error accessing platform client";
    }

    let apiInstance = new window.platformClient.RoutingApi();

    try {
        let queuesList = await apiInstance.getRoutingQueues(opts);
        console.log("Queues list retrieved successfully.");
        return JSON.stringify(queuesList);
    } catch (error) {
        console.error('Error in getQueuesList:', error);
        return `Error retrieving queues list: ${error.message}`;
    }
}

window.getQueuesList = getQueuesList;

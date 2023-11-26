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

// GCFunctions.js
async function getEstimatedWaitTime(queueId, conversationId) {
    if (!window.platformClient) {
        console.error("Platform client is not available");
        return "Error accessing platform client";
    }

    let apiInstance = new window.platformClient.RoutingApi();
    let opts = {};

    if (conversationId) {
        opts['conversationId'] = conversationId;
    }

    try {
        let waitTimeData = await apiInstance.getRoutingQueueEstimatedwaittime(queueId, opts);
        console.log("Estimated wait time retrieved successfully.");
        return JSON.stringify(waitTimeData);
    } catch (error) {
        console.error('Error in getEstimatedWaitTime:', error);
        return `Error retrieving estimated wait time: ${error.message}`;
    }
}

window.getEstimatedWaitTime = getEstimatedWaitTime;

async function modifyQueueMembers(queueId, members, isDelete) {
    if (!window.platformClient) {
        console.error("Platform client is not available");
        return "Error accessing platform client";
    }

    let apiInstance = new window.platformClient.RoutingApi();
    let opts = {
        '_delete': isDelete // Boolean | True to delete queue members, false to add them
    };

    try {
        await apiInstance.postRoutingQueueMembers(queueId, members, opts);
        return isDelete ? "Queue members deleted successfully." : "Queue members added successfully.";
    } catch (error) {
        console.error('Error in modifyQueueMembers:', error);
        return `Error modifying queue members: ${error.message}`;
    }
}

window.modifyQueueMembers = modifyQueueMembers;

async function searchUsers(searchCriteria) {
    if (!window.platformClient) {
        console.error("Platform client is not available");
        return "Error accessing platform client";
    }

    let apiInstance = new window.platformClient.UsersApi();

    try {
        let users = await apiInstance.postUsersSearch(searchCriteria);
        console.log("Users search successful.");
        return JSON.stringify(users);
    } catch (error) {
        console.error('Error in searchUsers:', error);
        return `Error searching users: ${error.message}`;
    }
}

window.searchUsers = searchUsers;

async function handleConversationDetailJob(jobParams) {
    if (!window.platformClient) {
        console.error("Platform client is not available");
        return "Error: Platform client not available";
    }

    let apiInstance = new window.platformClient.AnalyticsApi();
    let jobId;

    // Step 1: Submit the job
    try {
        const response = await apiInstance.postAnalyticsConversationsDetailsJobs(jobParams);
        jobId = response.id;
        console.log("Conversation detail job submitted successfully. Job ID:", jobId);
    } catch (error) {
        console.error('Error submitting conversation detail job:', error);
        return `Error submitting conversation detail job: ${error.message}`;
    }

    // Step 2: Poll for job status
    let jobStatus;
    try {
        do {
            const statusResponse = await apiInstance.getAnalyticsConversationsDetailsJob(jobId);
            jobStatus = statusResponse.state;
            console.log("Current job status:", jobStatus);
            if (jobStatus === "FAILED" || jobStatus === "CANCELLED" || jobStatus === "EXPIRED") {
                return `Job ended with status: ${jobStatus}`;
            }
            if (jobStatus !== "FULFILLED") {
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before polling again
            }
        } while (jobStatus !== "FULFILLED");
    } catch (error) {
        console.error('Error checking job status:', error);
        return `Error checking job status: ${error.message}`;
    }

    // Step 3: Fetch job results
    try {
        const resultsResponse = await apiInstance.getAnalyticsConversationsDetailsJobResults(jobId, {});
        console.log("Job results retrieved successfully.");
        return resultsResponse; // Return the job results
    } catch (error) {
        console.error('Error fetching job results:', error);
        return `Error fetching job results: ${error.message}`;
    }
}

window.handleConversationDetailJob = handleConversationDetailJob;


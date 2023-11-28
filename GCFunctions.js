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
        console.error("handleConversationDetailJob - Platform client is not available");
        return "Error: Platform client not available";
    }

    // Check if the interval is set
    if (!window.interval || window.interval.trim() === '') {
        console.error("handleConversationDetailJob - Interval is not set");
        // Display a toast to the user indicating that the interval is not selected
        displayToast("Please select a valid date and time interval.");
        return "Error: Interval not set";
    }

    let apiInstance = new window.platformClient.AnalyticsApi();
    let jobId;

    // Include the interval from the window object into the jobParams
    const updatedJobParams = {
        ...jobParams,
        interval: window.interval
    };

    // Step 1: Submit the job
    try {
        console.log("handleConversationDetailJob - Submitting job with params:", updatedJobParams);
        const response = await apiInstance.postAnalyticsConversationsDetailsJobs(updatedJobParams);
        console.log("handleConversationDetailJob - API response:", response);

        // Ensure jobId is extracted correctly from the response
        jobId = response.jobId;
        if (!jobId) {
            console.error("handleConversationDetailJob - No Job ID in response", response);
            return "Error: No Job ID returned from API";
        }

        console.log(`handleConversationDetailJob - Job submitted successfully. Job ID: ${jobId}`);
    } catch (error) {
        console.error('handleConversationDetailJob - Error submitting job:', error);
        return `Error submitting job: ${error.message}`;
    }

    // Step 2: Poll for job status
    let jobStatus;
    try {
        do {
            console.log(`handleConversationDetailJob - Polling for status of Job ID: ${jobId}`);
            const statusResponse = await apiInstance.getAnalyticsConversationsDetailsJob(jobId);
            jobStatus = statusResponse.state;
            console.log(`handleConversationDetailJob - Current job status: ${jobStatus}`);
            if (jobStatus !== "FULFILLED") {
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before polling again
            }
        } while (jobStatus !== "FULFILLED");
    } catch (error) {
        console.error('handleConversationDetailJob - Error checking job status:', error);
        return `Error checking job status: ${error.message}`;
    }

    // Step 3: Fetch job results
    try {
        console.log(`handleConversationDetailJob - Fetching results for Job ID: ${jobId}`);
        const resultsResponse = await apiInstance.getAnalyticsConversationsDetailsJobResults(jobId, {});
        console.log("handleConversationDetailJob - Job results retrieved successfully.");
        return resultsResponse; // Return the job results
    } catch (error) {
        console.error('handleConversationDetailJob - Error fetching job results:', error);
        return `Error fetching job results: ${error.message}`;
    }
}

window.handleConversationDetailJob = handleConversationDetailJob;
console.log("handleConversationDetailJob function attached to window");

async function deleteGroup(groupId) {
    if (!window.platformClient) {
        console.error("Platform client is not available");
        return "Failure";
    }

    let apiInstance = new window.platformClient.GroupsApi();

    try {
        await apiInstance.deleteGroup(groupId);
        console.log("Group deleted successfully.");
        return "Success";
    } catch (error) {
        console.error('Error in deleteGroup:', error);
        return "Failure";
    }
}

// Attach the function to the global window object
window.deleteGroup = deleteGroup;

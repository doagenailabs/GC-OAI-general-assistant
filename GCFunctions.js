async function deleteGroup(groupId) {
    if (!window.platformClient) {
        console.error("Platform client is not available");
        return "Failed to delete group";
    }

    let apiInstance = new window.platformClient.GroupsApi();

    try {
        await apiInstance.deleteGroup(groupId);
        console.log("Group deleted successfully.");
        return "Group deleted successfully";
    } catch (error) {
        console.error('Error in deleteGroup:', error);
        return "Failed to delete group";
    }
}

// Attach the function to the global window object
window.deleteGroup = deleteGroup;

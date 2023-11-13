async function deleteGenesysGroup(groupId) {
    let apiInstance = new platformClient.GroupsApi();

    try {
        await apiInstance.deleteGroup(groupId);
        console.log("deleteGroup returned successfully.");
        return "Group successfully deleted.";
    } catch (err) {
        console.log("There was a failure calling deleteGroup");
        console.error(err);
        return "Failed to delete group."; 
    }
}

export { deleteGenesysGroup };


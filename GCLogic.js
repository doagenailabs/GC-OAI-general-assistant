async function deleteGenesysGroup(groupId) {
    let apiInstance = new platformClient.GroupsApi();

    try {
        await apiInstance.deleteGroup(groupId);
        console.log("deleteGroup returned successfully.");
    } catch (err) {
        console.log("There was a failure calling deleteGroup");
        console.error(err);
    }
}

export { deleteGenesysGroup };


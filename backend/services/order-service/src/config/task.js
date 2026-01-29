const { CloudTasksClient } = require("@google-cloud/tasks");

const client = new CloudTasksClient();

module.exports = client;

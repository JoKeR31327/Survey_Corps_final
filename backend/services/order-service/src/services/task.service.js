const tasksClient = require("../config/task");
const {
  PROJECT_ID,
  LOCATION,
  QUEUE_NAME,
  INVENTORY_TASK_URL,
  INVENTORY_HTTP_URL
} = require("../config/env");

exports.enqueueInventoryTask = async (payload) => {
  if (!PROJECT_ID || !LOCATION || !QUEUE_NAME) {
    throw new Error("Missing Cloud Tasks env vars: PROJECT_ID, LOCATION, QUEUE_NAME");
  }

  const url = INVENTORY_TASK_URL || (INVENTORY_HTTP_URL ? `${INVENTORY_HTTP_URL}/tasks/reserve` : undefined);
  if (!url) {
    throw new Error("Missing inventory task URL: set INVENTORY_TASK_URL or INVENTORY_HTTP_URL");
  }

  const parent = tasksClient.queuePath(PROJECT_ID, LOCATION, QUEUE_NAME);

  const task = {
    httpRequest: {
      httpMethod: "POST",
      url,
      headers: {
        "Content-Type": "application/json"
      },
      body: Buffer.from(JSON.stringify(payload)).toString("base64")
    }
  };

  await tasksClient.createTask({ parent, task });
};

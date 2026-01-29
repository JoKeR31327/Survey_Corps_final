const tasksClient = require("../config/task");
const {
  PROJECT_ID,
  LOCATION,
  QUEUE_NAME,
  INVENTORY_TASK_URL,
  INVENTORY_HTTP_URL,
  USE_CLOUD_TASKS
} = require("../config/env");

exports.enqueueInventoryTask = async (payload) => {
  const url = INVENTORY_TASK_URL || (INVENTORY_HTTP_URL ? `${INVENTORY_HTTP_URL}/tasks/reserve` : undefined);
  if (!url) {
    throw new Error("Missing inventory task URL: set INVENTORY_TASK_URL or INVENTORY_HTTP_URL");
  }

  if (!USE_CLOUD_TASKS) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Inventory task HTTP failed: ${response.status} ${text}`);
    }

    return;
  }

  if (!PROJECT_ID || !LOCATION || !QUEUE_NAME) {
    throw new Error("Missing Cloud Tasks env vars: PROJECT_ID, LOCATION, QUEUE_NAME");
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

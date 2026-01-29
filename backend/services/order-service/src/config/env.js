require("dotenv").config();

module.exports = {
  HTTP_PORT: process.env.HTTP_PORT || 8080,
  JWT_SECRET: process.env.JWT_SECRET,
  INVENTORY_HTTP_URL: process.env.INVENTORY_HTTP_URL,

  USE_CLOUD_TASKS: process.env.USE_CLOUD_TASKS !== "false",

  PROJECT_ID: process.env.PROJECT_ID,
  LOCATION: process.env.LOCATION,
  QUEUE_NAME: process.env.QUEUE_NAME,
  INVENTORY_TASK_URL: process.env.INVENTORY_TASK_URL,

  INVENTORY_WAIT_MS: Number(process.env.INVENTORY_WAIT_MS || 15000),
  INVENTORY_POLL_MS: Number(process.env.INVENTORY_POLL_MS || 1000),
  ORDER_CALLBACK_SECRET: process.env.ORDER_CALLBACK_SECRET,

  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME
};

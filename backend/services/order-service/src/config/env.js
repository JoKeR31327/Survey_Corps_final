require("dotenv").config();

module.exports = {
  HTTP_PORT: process.env.HTTP_PORT || 8080,
  JWT_SECRET: process.env.JWT_SECRET,
  INVENTORY_HTTP_URL: process.env.INVENTORY_HTTP_URL,

  PROJECT_ID: process.env.PROJECT_ID,
  LOCATION: process.env.LOCATION,
  QUEUE_NAME: process.env.QUEUE_NAME,
  INVENTORY_TASK_URL: process.env.INVENTORY_TASK_URL,

  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME
};

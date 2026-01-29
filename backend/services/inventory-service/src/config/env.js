require("dotenv").config();

module.exports = {
  HTTP_PORT: process.env.HTTP_PORT || 8080,

  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,

  CHAOS_ENABLED: process.env.CHAOS_ENABLED === "true",
  CHAOS_DELAY_MS: Number(process.env.CHAOS_DELAY_MS || 5000),
  CHAOS_MODULO: Number(process.env.CHAOS_MODULO || 5),

  CHAOS_POST_COMMIT_FAIL: process.env.CHAOS_POST_COMMIT_FAIL === "true",
  CHAOS_FAIL_MODULO: Number(process.env.CHAOS_FAIL_MODULO || 3),

  OUTBOX_RETRY_MS: Number(process.env.OUTBOX_RETRY_MS || 5000),
  OUTBOX_MAX_ATTEMPTS: Number(process.env.OUTBOX_MAX_ATTEMPTS || 10),

  ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL,
  ORDER_CALLBACK_SECRET: process.env.ORDER_CALLBACK_SECRET
};

module.exports = {
  HTTP_PORT: process.env.HTTP_PORT || 8080,
  JWT_SECRET: process.env.JWT_SECRET,

  INVENTORY_HTTP_URL: process.env.INVENTORY_HTTP_URL,
  INVENTORY_GRPC_HOST: process.env.INVENTORY_GRPC_HOST,

  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME
};

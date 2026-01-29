require("dotenv").config();

module.exports = {
  HTTP_PORT: process.env.HTTP_PORT || 8080,
  JWT_SECRET: process.env.JWT_SECRET,
  INVENTORY_HTTP_URL: process.env.INVENTORY_HTTP_URL,
  INVENTORY_GRPC_HOST: process.env.INVENTORY_GRPC_HOST
};

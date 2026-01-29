const app = require("./app");
const grpcServer = require("./grpc/inventory.server");
const { HTTP_PORT } = require("./config/env");

app.listen(HTTP_PORT, () =>
  console.log(`Inventory HTTP running on ${HTTP_PORT}`)
);

grpcServer.start();

const grpc = require("@grpc/grpc-js");
const loader = require("@grpc/proto-loader");
const path = require("path");
const { GRPC_PORT } = require("../config/env");
const handler = require("./inventory.handler");

const pkg = loader.loadSync(path.join(__dirname, "inventory.proto"));
const proto = grpc.loadPackageDefinition(pkg);

const server = new grpc.Server();
server.addService(proto.InventoryService.service, handler);

exports.start = () => {
  server.bindAsync(
    `0.0.0.0:${GRPC_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    () => {
      server.start();
      console.log(`Inventory gRPC running on ${GRPC_PORT}`);
    }
  );
};

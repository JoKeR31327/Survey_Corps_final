const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const { INVENTORY_GRPC_HOST } = require("./env");

const pkgDef = protoLoader.loadSync(
  path.join(__dirname, "../proto/inventory.proto")
);
const proto = grpc.loadPackageDefinition(pkgDef);

const inventoryClient = new proto.InventoryService(
  INVENTORY_GRPC_HOST,
  grpc.credentials.createInsecure()
);

module.exports = inventoryClient;

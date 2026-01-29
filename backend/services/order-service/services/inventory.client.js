const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const pkgDef = protoLoader.loadSync(
  __dirname + "/../proto/inventory.proto",
  { keepCase: true }
);

const inventoryProto =
  grpc.loadPackageDefinition(pkgDef).inventory;

let client;

function getClient() {
  if (!client) {
    client = new inventoryProto.InventoryService(
      process.env.INVENTORY_SERVICE_ADDR || "localhost:50051",
      grpc.credentials.createInsecure()
    );
  }
  return client;
}

exports.reserveStock = (orderId) =>
  new Promise((resolve, reject) => {
    getClient().ReserveStock(
      { orderId },
      { deadline: Date.now() + 2000 }, // timeout is BUILD-CRITICAL
      (err, res) => {
        if (err) return reject(err);
        resolve(res.success);
      }
    );
  });

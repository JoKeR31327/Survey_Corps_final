const inventoryClient = require("../config/grpc");
const retry = require("../utils/retry");

const INVENTORY_TIMEOUT_MS = 1000;
const RETRIES = 3;

exports.reserveInventory = async ({ orderId, productId, quantity }) => {
  return retry(() => {
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + INVENTORY_TIMEOUT_MS;

      inventoryClient.ReserveStock(
        {
          order_id: orderId,
          product_id: productId,
          quantity
        },
        { deadline },
        (err, res) => {
          if (err) return reject(err);
          resolve(res);
        }
      );
    });
  }, RETRIES, 100);
};

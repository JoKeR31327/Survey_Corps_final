const inventoryClient = require("../config/grpc");
const retry = require("../utils/retry");
const orders = require("../models/order.model");

const INVENTORY_TIMEOUT_MS = 1000;
const RETRIES = 3;

exports.createOrder = async ({ orderId, userId, productId, quantity }) => {
  // 1️⃣ Save initial order
  await orders.create({
    orderId,
    userId,
    productId,
    quantity,
    status: "PENDING"
  });

  try {
    // 2️⃣ Call Inventory
    const result = await retry(() => {
      return new Promise((resolve, reject) => {
        inventoryClient.ReserveStock(
          { order_id: orderId, product_id: productId, quantity },
          { deadline: Date.now() + INVENTORY_TIMEOUT_MS },
          (err, res) => err ? reject(err) : resolve(res)
        );
      });
    }, RETRIES, 100);

    if (!result.success) {
      await orders.updateStatus(orderId, "FAILED");
      return { success: false };
    }

    await orders.updateStatus(orderId, "CONFIRMED");
    return { success: true, replay: result.replay };

  } catch (e) {
    await orders.updateStatus(orderId, "FAILED");
    throw e;
  }
};

const orders = require("../models/order.model");
const inventoryTx = require("../models/inventory-transaction.model");
const { INVENTORY_WAIT_MS, INVENTORY_POLL_MS } = require("../config/env");
const { enqueueInventoryTask } = require("./task.service");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.createOrder = async ({ orderId, userId, productId, quantity }) => {
  await orders.create({
    orderId,
    userId,
    productId,
    quantity,
    status: "PENDING"
  });

  await enqueueInventoryTask({
    order_id: orderId,
    product_id: productId,
    quantity
  });

  const deadline = Date.now() + INVENTORY_WAIT_MS;
  while (Date.now() < deadline) {
    const tx = await inventoryTx.findByOrderId(orderId);
    if (tx?.status === "SUCCESS") {
      await orders.updateStatus(orderId, "CONFIRMED");
      return { status: "CONFIRMED" };
    }
    if (tx?.status === "FAILED") {
      await orders.updateStatus(orderId, "FAILED");
      return { status: "FAILED" };
    }
    await sleep(INVENTORY_POLL_MS);
  }

  return { queued: true, status: "PROCESSING" };
};

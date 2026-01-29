const orders = require("../models/order.model");
const { enqueueInventoryTask } = require("./task.service");

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

  return { queued: true };
};

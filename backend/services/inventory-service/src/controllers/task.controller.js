const inventoryService = require("../services/inventory.service");
const { ORDER_SERVICE_URL, ORDER_CALLBACK_SECRET } = require("../config/env");

const notifyOrderService = async (orderId, status) => {
  if (!ORDER_SERVICE_URL || !ORDER_CALLBACK_SECRET) return;

  try {
    await fetch(`${ORDER_SERVICE_URL}/api/orders/${orderId}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-callback-token": ORDER_CALLBACK_SECRET
      },
      body: JSON.stringify({ status })
    });
  } catch (err) {
    console.error("Order callback failed", err);
  }
};

exports.reserveStockTask = async (req, res, next) => {
  try {
    const { order_id, product_id, quantity } = req.body || {};

    if (!order_id || !product_id || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({ message: "Invalid task payload" });
    }

    const result = await inventoryService.reserveStock({
      orderId: order_id,
      productId: product_id,
      quantity: Number(quantity)
    });

    await notifyOrderService(
      order_id,
      result.success === true ? "CONFIRMED" : "FAILED"
    );

    return res.status(200).json({
      order_id,
      success: result.success === true,
      replay: result.replay === true
    });
  } catch (err) {
    return next(err);
  }
};

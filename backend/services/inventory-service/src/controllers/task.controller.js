const inventoryService = require("../services/inventory.service");

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

    // Always ACK the task (2xx). Treat business failure as a successful processing.
    return res.status(200).json({
      order_id,
      success: result.success === true,
      replay: result.replay === true
    });
  } catch (err) {
    return next(err);
  }
};

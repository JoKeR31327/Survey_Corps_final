const { reserveInventory } = require("../services/order.service");
const { v4: uuidv4 } = require("uuid");

exports.createOrder = async (req, res, next) => {
  try {
    const { product_id, quantity } = req.body;
    const orderId = uuidv4();

    const result = await reserveInventory({
      orderId,
      productId: product_id,
      quantity
    });

    if (!result.success) {
      return res.status(409).json({
        message: "Out of stock"
      });
    }

    res.status(201).json({
      order_id: orderId,
      message: result.replay ? "Order confirmed (replay)" : "Order confirmed"
    });
  } catch (e) {
    // Inventory slow or unavailable
    res.status(503).json({
      message: "Inventory temporarily unavailable. Please retry."
    });
  }
};

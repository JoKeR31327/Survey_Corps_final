const { v4: uuidv4 } = require("uuid");
const orderService = require("../services/order.service");
const orders = require("../models/order.model");

exports.createOrder = async (req, res) => {
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity <= 0) {
    return res.status(400).json({ message: "Invalid order request" });
  }

  const userId = req.user.sub;
  const orderId = uuidv4();

  try {
    const result = await orderService.createOrder({
      orderId,
      userId,
      productId: product_id,
      quantity
    });

    if (!result.success) {
      return res.status(409).json({ message: "Out of stock" });
    }

    res.status(201).json({
      order_id: orderId,
      status: "CONFIRMED",
      replay: result.replay === true
    });

  } catch {
    res.status(503).json({
      message: "Inventory unavailable, try again"
    });
  }
};

exports.listOrders = async (req, res) => {
  const userId = req.user.sub;
  const data = await orders.findByUser(userId);
  res.json(data);
};

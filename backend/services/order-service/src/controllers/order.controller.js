const { v4: uuidv4 } = require("uuid");
const orderService = require("../services/order.service");
const orders = require("../models/order.model");
const { ORDER_CALLBACK_SECRET } = require("../config/env");

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

    if (result.status === "CONFIRMED") {
      return res.status(201).json({
        order_id: orderId,
        status: "CONFIRMED"
      });
    }

    if (result.status === "FAILED") {
      return res.status(409).json({
        order_id: orderId,
        status: "FAILED",
        message: "Out of stock"
      });
    }

    return res.status(202).json({
      order_id: orderId,
      status: "PROCESSING",
      queued: result.queued === true
    });


  } catch {
    res.status(503).json({
      message: "Inventory unavailable, try again"
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const token = req.header("x-callback-token");
  if (!ORDER_CALLBACK_SECRET || token !== ORDER_CALLBACK_SECRET) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { status } = req.body || {};
  if (!status || !["CONFIRMED", "FAILED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  await orders.updateStatus(req.params.id, status);
  return res.json({ ok: true });
};

exports.listOrders = async (req, res) => {
  const userId = req.user.sub;
  const data = await orders.findByUser(userId);
  res.json(data);
};

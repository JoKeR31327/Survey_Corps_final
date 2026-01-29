const service = require("../services/order.service");

exports.createOrder = async (req, res) => {
  const order = await service.createOrder({
    userId: req.user?.id || "mock-user",
    idempotencyKey: req.idempotencyKey
  });

  res.status(201).json(order);
};

exports.getOrder = async (req, res) => {
  const order = await service.getOrder(req.params.id);
  res.json(order);
};

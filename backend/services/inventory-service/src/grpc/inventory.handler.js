const service = require("../services/inventory.service");

exports.reserveStock = async (call, cb) => {
  try {
    const result = await service.reserveStock({
      orderId: call.request.order_id,
      productId: call.request.product_id,
      quantity: call.request.quantity
    });
    cb(null, result);
  } catch (e) {
    cb(e);
  }
};

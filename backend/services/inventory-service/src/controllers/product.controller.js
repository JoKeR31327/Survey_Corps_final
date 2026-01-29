const inventoryService = require("../services/inventory.service");

exports.getAll = async (_, res, next) => {
  try {
    res.json(await inventoryService.getProducts());
  } catch (e) {
    next(e);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const product = await inventoryService.getProduct(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (e) {
    next(e);
  }
};

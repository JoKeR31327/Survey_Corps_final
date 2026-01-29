const router = require("express").Router();
const orderRoutes = require("./order.routes");
const productRoutes = require("./product.routes");
const health = require("../health/health.controller");

router.use("/orders", orderRoutes);
router.use("/products", productRoutes);
router.get("/health", health);

module.exports = router;

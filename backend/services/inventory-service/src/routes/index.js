const router = require("express").Router();
const productRoutes = require("./product.routes");
const health = require("../health/health.controller");

router.use("/products", productRoutes);
router.get("/health", health);

module.exports = router;

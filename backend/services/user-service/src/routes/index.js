const router = require("express").Router();
const authRoutes = require("./auth.routes");
const health = require("../health/health.controller");

router.use("/auth", authRoutes);
router.get("/health", health);

module.exports = router;

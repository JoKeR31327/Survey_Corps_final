const router = require("express").Router();
const controller = require("../controllers/task.controller");

router.post("/reserve", controller.reserveStockTask);

module.exports = router;

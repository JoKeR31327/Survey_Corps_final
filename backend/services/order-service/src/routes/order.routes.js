const router = require("express").Router();
const controller = require("../controllers/order.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/", auth, controller.createOrder);
router.get("/", auth, controller.listOrders);


module.exports = router;

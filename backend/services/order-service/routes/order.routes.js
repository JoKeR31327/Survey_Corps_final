const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const idempotency = require("../middleware/idempotency.middleware");
const controller = require("../controllers/order.controller");

router.post("/", auth, idempotency, controller.createOrder);
router.get("/:id", auth, controller.getOrder);

module.exports = router;

const router = require("express").Router();
const controller = require("../controllers/monitor.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/logs", auth, controller.getLogs);

module.exports = router;

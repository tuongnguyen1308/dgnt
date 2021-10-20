const router = require("express").Router();
const controller = require("../../controllers/customer/cOrder");

router.get("/", controller.index);

module.exports = router;

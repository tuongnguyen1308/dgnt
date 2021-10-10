const router = require("express").Router();
const controller = require("../../controllers/customer/cCart");

router.get("/", controller.index);

module.exports = router;

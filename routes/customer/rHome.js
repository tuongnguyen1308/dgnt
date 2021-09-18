const router = require("express").Router();
const controller = require("../../controllers/customer/cHome");

router.get("/", controller.index);

module.exports = router;

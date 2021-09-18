const router = require("express").Router();
const controller = require("../../controllers/customer/cAbout");

router.get("/", controller.index);

module.exports = router;

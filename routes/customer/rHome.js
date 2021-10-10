const router = require("express").Router();
const controller = require("../../controllers/customer/cHome");

router.get("/", controller.index);
router.get("/:keyword", controller.filter);

module.exports = router;

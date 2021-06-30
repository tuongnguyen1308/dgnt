const router = require("express").Router();
const controller = require("../../controllers/staff/cStaff");

router.get("/", controller.index);
router.post("/add", controller.add);
router.post("/update", controller.update);

module.exports = router;

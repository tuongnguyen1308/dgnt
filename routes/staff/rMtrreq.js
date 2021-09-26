const router = require("express").Router();
const controller = require("../../controllers/staff/cMtrreq");

router.get("/", controller.index);
router.post("/add", controller.add);
router.post("/update", controller.update);
router.patch("/:id", controller.patch);

module.exports = router;

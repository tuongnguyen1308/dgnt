const router = require("express").Router();
const controller = require("../../controllers/staff/cAppoinmentM");

router.get("/", controller.index);
router.post("/add", controller.add);
router.post("/update", controller.update);
router.post("/updres", controller.updres);
router.delete("/:id", controller.delete);
router.post("/find-customers", controller.find);

module.exports = router;

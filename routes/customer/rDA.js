const router = require("express").Router();
const controller = require("../../controllers/customer/cDA");

router.get("/", controller.index);
router.post("/add", controller.add);
router.post("/update", controller.update);
router.delete("/:id", controller.delete);

module.exports = router;

const router = require("express").Router();
const controller = require("../../controllers/customer/cPrepareOrder");

router.get("/", controller.index);
// router.post("/add", controller.add);
// router.patch("/update", controller.update);
// router.patch("/remove-product", controller.remove);

module.exports = router;

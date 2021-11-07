const router = require("express").Router();
const controller = require("../../controllers/staff/cOrderM");

router.get("/", controller.index);
router.get("/view", controller.view);
router.post("/find", controller.find);
router.post("/add", controller.add);
router.post("/update-state", controller.updateState);
router.post("/update-money", controller.updateMoney);

router.post("/statistic", controller.statistic);

module.exports = router;

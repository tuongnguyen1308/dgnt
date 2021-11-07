const router = require("express").Router();
const controller = require("../../controllers/staff/cStatistic");

router.get("/", controller.index);

module.exports = router;

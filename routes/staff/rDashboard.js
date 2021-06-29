const router = require("express").Router();
const controller = require("../../controllers/staff/cDashboard");

router.get("/", controller.index);

module.exports = router;

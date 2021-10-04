const router = require("express").Router();
const controller = require("../../controllers/staff/cProductManagement");

router.get("/", controller.index);

module.exports = router;

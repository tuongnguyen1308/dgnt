const router = require("express").Router();
const controller = require("../../controllers/staff/cLogin");

router.get("/", controller.index);
router.post("/auth", controller.auth);
router.get("/logout", controller.logout);

module.exports = router;

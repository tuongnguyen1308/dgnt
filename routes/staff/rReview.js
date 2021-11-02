const router = require("express").Router();
const controller = require("../../controllers/staff/cReview");

router.get("/", controller.index);
router.patch("/:id", controller.patch);

module.exports = router;

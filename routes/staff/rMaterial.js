const router = require("express").Router();
const controller = require("../../controllers/staff/cMaterial");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/materials/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/", controller.index);
router.post("/add", upload.single("mImg"), controller.add);
router.post("/update", upload.single("mImg"), controller.update);
router.delete("/:id", controller.delete);
router.post("/find", controller.find);
router.post("/statistic", controller.statistic);

module.exports = router;

const router = require("express").Router();
const controller = require("../../controllers/staff/cAbout");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/banner/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/", controller.index);
router.post("/banner-add", upload.single("bImg"), controller.bannerAdd);
router.post("/banner-update", controller.bannerUpdate);
router.delete("/banner-delete/:id", controller.bannerDelete);

router.post("/pm-add", controller.pmAdd);
router.post("/pm-update", controller.pmUpdate);
router.delete("/pm-delete/:id", controller.pmDelete);

module.exports = router;

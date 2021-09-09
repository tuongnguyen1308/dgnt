const router = require("express").Router();
const controller = require("../../controllers/staff/cAbout");
const multer = require("multer");
const bstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/banner/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const bupload = multer({ storage: bstorage });

const sistorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/logo/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const siupload = multer({ storage: sistorage });

router.get("/", controller.index);
// banner
router.post("/banner-add", bupload.single("bImg"), controller.bannerAdd);
router.post("/banner-update", controller.bannerUpdate);
router.delete("/banner-delete/:id", controller.bannerDelete);
// payment method
router.post("/pm-add", controller.pmAdd);
router.post("/pm-update", controller.pmUpdate);
router.delete("/pm-delete/:id", controller.pmDelete);
// shopinfo
router.post("/si-update", siupload.single("siLogo"), controller.siUpdate);

module.exports = router;

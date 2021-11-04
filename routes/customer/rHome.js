const router = require("express").Router();
const controller = require("../../controllers/customer/cHome");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/reviews/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });
const multipleUpload = upload.fields([{ name: "riImg" }]);

router.get("/", controller.index);
router.get("/:keyword", controller.filter);
router.post("/find-product", controller.find);
router.post("/add-review", multipleUpload, controller.addReview);
router.post("/upd-review", multipleUpload, controller.updReview);

module.exports = router;

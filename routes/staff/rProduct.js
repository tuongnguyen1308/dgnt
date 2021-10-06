const router = require("express").Router();
const controller = require("../../controllers/staff/cProduct");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/products/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });
const multipleUpload = upload.fields([{ name: "pImg" }]);

router.get("/", controller.index);
router.post("/add", multipleUpload, controller.add);
router.post("/update", multipleUpload, controller.update);
router.delete("/:id", controller.delete);
router.post("/find", controller.find);

module.exports = router;

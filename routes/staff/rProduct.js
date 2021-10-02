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

router.get("/", controller.index);
router.post("/add", upload.single("pImg"), controller.add);
router.post("/update", upload.single("pImg"), controller.update);
router.delete("/:id", controller.delete);

module.exports = router;

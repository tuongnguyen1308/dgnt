const router = require("express").Router();
const controller = require("../../controllers/staff/cProductType");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/product-type/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/", controller.index);
router.post("/add", upload.single("tImg"), controller.add);
router.post("/update", upload.single("tImg"), controller.update);
router.delete("/:id", controller.delete);

module.exports = router;

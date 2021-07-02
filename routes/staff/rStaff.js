const router = require("express").Router();
const controller = require("../../controllers/staff/cStaff");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/users/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/", controller.index);
router.post("/add", upload.single("avatar"), controller.add);
router.post("/update", upload.single("avatar"), controller.update);
router.delete("/:id", controller.delete);

module.exports = router;

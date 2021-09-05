const router = require("express").Router();
const controller = require("../../controllers/staff/cProfile");
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
router.post("/update", upload.single("sImg"), controller.update);
router.post("/change-password", controller.changePassword);

module.exports = router;

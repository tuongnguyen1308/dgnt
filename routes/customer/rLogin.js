const router = require("express").Router();
const controller = require("../../controllers/customer/cLogin");
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

router.post("/auth", controller.auth);
router.post("/signup", upload.single("cImg"), controller.signup);
router.get("/logout", controller.logout);

module.exports = router;

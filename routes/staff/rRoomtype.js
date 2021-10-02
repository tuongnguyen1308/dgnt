const router = require("express").Router();
const controller = require("../../controllers/staff/cRoomtype");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/roomtypes/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/", controller.index);
router.post("/add", upload.single("rtImg"), controller.add);
router.post("/update", upload.single("rtImg"), controller.update);
router.delete("/:id", controller.delete);

module.exports = router;

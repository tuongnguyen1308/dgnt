const Roomtype = require("../../models/mRoomtype");
const Category = require("../../models/mCategory");
const pI = { title: "Quản lý sản phẩm", url: "product" };
const rootRoute = `/${pI.url}-management`;

const redirectFunc = (state, text, dir, req, res) => {
  req.session.messages = {
    icon: state ? "check-circle" : "alert-circle",
    color: state ? "success" : "danger",
    title: state ? "Thành công" : "Thất bại",
    text,
  };
  res.redirect(dir);
  return;
};

const createSlug = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(" ")
    .join("-")
    .toLowerCase();

module.exports.index = async (req, res) => {
  res.redirect(dir);
};

module.exports.add = async (req, res) => {
  let rtName = req.body.rtName.trim();
  if (rtName.length == 0) {
    redirectFunc(false, "Tên loại phòng là bắt buộc!", rootRoute, req, res);
  } else if (rtName.length > 50) {
    redirectFunc(false, "Tên loại phòng tối đa 50 ký tự!", rootRoute, req, res);
  } else
    await Roomtype.findOne({ rtName }, async (err, rtFound) => {
      if (err) {
        redirectFunc(false, "Thêm loại phòng thất bại", rootRoute, req, res);
      } else if (rtFound) {
        redirectFunc(false, "Tên loại phòng đã tồn tại", rootRoute, req, res);
      } else {
        const sess = req.session.user;
        let newRoomtype = new Roomtype({
          rtName,
          slugName: createSlug(rtName),
          rtImg: req.file.filename,
          sId: sess.sId,
        });
        if (!newRoomtype.rtImg.match(/\.(jpg|jpeg|png)$/i)) {
          redirectFunc(false, "Ảnh không hợp lệ!", rootRoute, req, res);
          return;
        }
        await newRoomtype.save();
        redirectFunc(true, "Thêm loại phòng thành công!", rootRoute, req, res);
      }
    });
};

module.exports.update = async (req, res) => {
  let updRT = {
    rtName: req.body.rtName.trim(),
    slugName: createSlug(req.body.rtName),
  };

  if (updRT.rtName.length == 0) {
    redirectFunc(false, "Tên loại phòng là bắt buộc!", rootRoute, req, res);
  } else if (updRT.rtName.length > 50) {
    redirectFunc(false, "Tên loại phòng tối đa 50 ký tự!", rootRoute, req, res);
  } else {
    let rtImg = req.file?.filename || false;
    if (rtImg) {
      updRT.rtImg = rtImg;
      if (!updRT.rtImg.match(/\.(jpg|jpeg|png)$/i)) {
        redirectFunc(false, "Ảnh không hợp lệ!", rootRoute, req, res);
        return;
      }
    }
    const rtFound = await Roomtype.find({
      rtName: updRT.rtName,
      _id: { $ne: req.body.id },
    });
    if (rtFound.length > 0) {
      redirectFunc(false, "Tên loại phòng đã tồn tại!", rootRoute, req, res);
    } else
      try {
        await Roomtype.findByIdAndUpdate(req.body.id, { $set: updRT });
        redirectFunc(true, "Cập nhật thành công!", rootRoute, req, res);
      } catch (error) {
        redirectFunc(false, "Cập nhật thất bại!", rootRoute, req, res);
      }
  }
};

module.exports.delete = async (req, res) => {
  let room_in_used = await Category.find({
    rtId: req.params.id,
  }).countDocuments();
  if (room_in_used == 0) {
    await Roomtype.findByIdAndDelete(req.params.id, function (err) {
      req.session.messages = {
        icon: !err ? "check-circle" : "alert-circle",
        color: !err ? "success" : "danger",
        title: !err ? "Thành công!" : "Thất bại",
        text: !err ? "Xóa loại phòng thành công!" : "Xóa loại phòng thất bại!",
      };
      res.json(!err);
    });
  } else {
    req.session.messages = {
      icon: "alert-circle",
      color: "danger",
      title: "Thất bại",
      text: "Không thể xóa loại phòng đã có danh mục!",
    };
    res.json(false);
  }
};

const Category = require("../../models/mCategory");
const pI = { title: "Quản lý sản phẩm", url: "product" };
const rootRoute = `/${pI.url}-management`;

let redirectFunc = (state, text, dir, req, res) => {
  req.session.messages = {
    icon: state ? "check-circle" : "alert-circle",
    color: state ? "success" : "danger",
    title: state ? "Thành công" : "Thất bại",
    text,
  };
  res.redirect(dir);
  return;
};

module.exports.index = async (req, res) => {
  res.redirect(dir);
};

module.exports.add = async (req, res) => {
  let pcName = req.body.pcName;
  await Category.findOne({ pcName }, async (err, pcFound) => {
    if (err) {
      redirectFunc(false, "Thêm danh mục thất bại", rootRoute, req, res);
    } else if (pcFound) {
      redirectFunc(false, "Tên danh mục đã tồn tại", rootRoute, req, res);
    } else {
      const sess = req.session.user;
      let newCategory = new Category({
        pcName,
        pcImg: req.file.filename,
        rtId: req.body.rtId,
        sId: sess.sId,
      });
      await newCategory.save();
      redirectFunc(true, "Thêm danh mục thành công!", rootRoute, req, res);
    }
  });
};

module.exports.update = async (req, res) => {
  let updCategory = {
    pcName: req.body.pcName,
    rtId: req.body.rtId,
  };
  let pcImg = req.file?.filename || false;
  if (pcImg) {
    updCategory.pcImg = pcImg;
  }
  const pcFound = await Category.find({
    pcName: updCategory.pcName,
    _id: { $ne: req.body.id },
  });
  if (pcFound.length > 0) {
    redirectFunc(false, "Tên danh mục đã tồn tại!", rootRoute, req, res);
  } else
    try {
      await Category.findByIdAndUpdate(req.body.id, { $set: updCategory });
      redirectFunc(true, "Cập nhật thành công!", rootRoute, req, res);
    } catch (error) {
      redirectFunc(false, "Cập nhật thất bại!", rootRoute, req, res);
    }
  return;
};

module.exports.delete = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id, function (err) {
    req.session.messages = {
      icon: !err ? "check-circle" : "alert-circle",
      color: !err ? "success" : "danger",
      title: !err ? "Thành công!" : "Thất bại",
      text: !err ? "Xóa danh mục thành công!" : "Xóa danh mục thất bại!",
    };
    res.json(!err);
  });
};

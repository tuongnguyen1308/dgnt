const Product = require("../../models/mProduct");
const pI = { title: "Quản lý sản phẩm", url: "products" };
const rootRoute = `/${pI.url}`;

module.exports.index = async (req, res) => {
  const messages = req.session?.messages || null;
  const sess = req.session.user;
  req.session.messages = null;
  let products = await Product.find({});
  res.render(`./staff/${pI.url}`, {
    pI,
    messages,
    products,
    sess,
  });
};

module.exports.add = (req, res) => {
  Product.find({ tName: req.body.tName }, async (err, products_found) => {
    let redirectFunc = (icon, color, title, text, dir) => {
      req.session.messages = {
        icon,
        color,
        title,
        text,
      };
      res.redirect(dir);
      return;
    };
    if (err) {
      redirectFunc(
        "alert-circle",
        "danger",
        "Thất bại!",
        "Có lỗi xảy ra trong quá trình thêm!",
        rootRoute
      );
    } else if (products_found.length) {
      redirectFunc(
        "alert-circle",
        "danger",
        "Thất bại!",
        "Sản phẩm này đã tồn tại!",
        rootRoute
      );
    } else {
      let newProductType = new Product({
        tName: req.body.tName,
        tImg: req.file.filename,
        tState: req.body.tState == "on",
      });
      let result = await newProductType.save();
      redirectFunc(
        "check-circle",
        "success",
        "Thành công",
        `Đã thêm sản phẩm ${req.body.tName}`,
        rootRoute
      );
    }
  });
  return;
};

module.exports.update = async (req, res) => {
  let updProductType = {
    tName: req.body.tName,
    tState: req.body.tState == "on",
  };
  let tImg = req.file?.filename;
  if (tImg) {
    updProductType.tImg = tImg;
  }
  let result = await Product.findByIdAndUpdate(req.body.id, {
    $set: updProductType,
  });
  req.session.messages = {
    icon: "check-circle",
    color: "success",
    title: "Thành công!",
    text: "Đã cập nhât loại sản phẩm",
  };
  res.redirect(rootRoute);
  return;
};

module.exports.delete = async (req, res) => {
  let result = await Product.deleteOne({ _id: req.params.id }, function (err) {
    err && res.json(err);
  });
  req.session.messages = {
    icon: result ? "check-circle" : "alert-circle",
    color: result ? "success" : "danger",
    title: result ? "Thành công!" : "Thất bại",
    text: result ? "Đã xoá thành viên" : "Đã có lỗi xảy ra",
  };
  res.json(result);
};

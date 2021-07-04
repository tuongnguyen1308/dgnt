const ProductType = require("../../models/mProductType");
const rootRoute = "/product-type";

module.exports.index = async (req, res) => {
  const title = "Quản lý Loại sản phẩm";
  const curPage = "product-type";
  const messages = req.session?.messages || null;
  const sess = req.session.user;
  req.session.messages = null;
  let productTypes = await ProductType.find({});
  res.render("./staff/productType", {
    title,
    curPage,
    messages,
    productTypes,
    sess,
  });
};

module.exports.add = (req, res) => {
  ProductType.find(
    { tName: req.body.tName },
    async (err, productTypes_found) => {
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
      } else if (productTypes_found.length) {
        redirectFunc(
          "alert-circle",
          "danger",
          "Thất bại!",
          "Loại sản phẩm này đã tồn tại!",
          rootRoute
        );
      } else {
        let newProductType = new ProductType({
          tName: req.body.tName,
          tImg: req.file.filename,
          tState: req.body.tState == "on",
        });
        let result = await newProductType.save();
        redirectFunc(
          "check-circle",
          "success",
          "Thành công",
          `Đã thêm loại sản phẩm ${req.body.tName}`,
          rootRoute
        );
      }
    }
  );
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
  let result = await ProductType.findByIdAndUpdate(req.body.id, {
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
  let result = await ProductType.deleteOne(
    { _id: req.params.id },
    function (err) {
      err && res.json(err);
    }
  );
  req.session.messages = {
    icon: result ? "check-circle" : "alert-circle",
    color: result ? "success" : "danger",
    title: result ? "Thành công!" : "Thất bại",
    text: result ? "Đã xoá thành viên" : "Đã có lỗi xảy ra",
  };
  res.json(result);
};

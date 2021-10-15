const Product = require("../../models/mProduct");
const Prdreq = require("../../models/mPrdreq");
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
  res.redirect(rootRoute);
};

module.exports.add = async (req, res) => {
  Product.find({ pName: req.body.pName }, async (err, pFound) => {
    if (pFound.length > 0) {
      redirectFunc(false, "Tên sản phẩm đã tồn tại!", rootRoute, req, res);
    } else {
      const sess = req.session.user;

      // material consume
      let mIds = req.body.mId;
      let mQuantitys = req.body.mQuantity;
      if (typeof mIds === "string") {
        mIds = [mIds];
        mQuantitys = [mQuantitys];
      }
      let mConsume = [];
      mIds.map((mId, index) => {
        mConsume.push({ mId, mQuantity: mQuantitys[index] });
      });

      // product imgs
      let pImgs = [];
      req.files.pImg.map((img) => {
        pImgs.push({
          piImg: img.filename,
          piIsMain: img.originalname == req.body.mainimg,
        });
      });
      try {
        let newProduct = new Product({
          pName: req.body.pName.trim(),
          slugName: createSlug(req.body.pName),
          pUnit: req.body.pUnit,
          pSize: req.body.pSize,
          pPrice: req.body.pPrice,
          pDiscount: req.body.pDiscount || 0,
          pDesc: req.body.pDesc.trim(),
          pState: req.body.pState == "on",
          pStock: 0,
          mConsume,
          pImgs,
          pcId: req.body.pcId,
          sId: sess.sId,
        });
        if (newProduct.pName.length > 50) {
          redirectFunc(
            false,
            "Tên sản phẩm tối đa 50 ký tự!",
            rootRoute,
            req,
            res
          );
        } else {
          await newProduct.save();
          redirectFunc(true, "Thêm sản phẩm thành công!", rootRoute, req, res);
        }
      } catch (error) {
        console.log(error);
        redirectFunc(false, "Thêm sản phẩm thất bại!", rootRoute, req, res);
      }
    }
  });
  return;
};

module.exports.update = async (req, res) => {
  Product.find(
    { pName: req.body.pName, _id: { $ne: req.body.id } },
    async (err, pFound) => {
      if (pFound.length > 0) {
        redirectFunc(false, "Tên sản phẩm đã tồn tại!", rootRoute, req, res);
      } else {
        const sess = req.session.user;

        // material consume
        let mIds = req.body.mId;
        let mQuantitys = req.body.mQuantity;
        if (typeof mIds === "string") {
          mIds = [mIds];
          mQuantitys = [mQuantitys];
        }
        let mConsume = [];
        mIds.map((mId, index) => {
          mConsume.push({ mId, mQuantity: mQuantitys[index] });
        });

        // product imgs
        let pImgs = [];
        if (req.files.pImg.length > 0) {
          req.files.pImg.map((img) => {
            pImgs.push({
              piImg: img.filename,
              piIsMain: img.originalname == req.body.mainimg,
            });
          });
        } else {
          let dbproduct = await Product.findOne({ _id: req.body.id });
          dbproduct.pImgs.map((img) => {
            pImgs.push({
              piImg: img.piImg,
              piIsMain: img.piImg == req.body.mainimg,
            });
          });
        }
        console.log(pImgs);
        let updProduct = {
          pName: req.body.pName,
          slugName: createSlug(req.body.pName),
          pUnit: req.body.pUnit,
          pSize: req.body.pSize,
          pPrice: req.body.pPrice,
          pDiscount: req.body.pDiscount,
          pDesc: req.body.pDesc,
          pState: req.body.pState == "on",
          mConsume,
          pImgs,
          pcId: req.body.pcId,
          sId: sess.sId,
        };
        try {
          if (updProduct.pName.length > 50) {
            redirectFunc(
              false,
              "Tên sản phẩm tối đa 50 ký tự!",
              rootRoute,
              req,
              res
            );
          } else {
            await Product.findByIdAndUpdate(req.body.id, { $set: updProduct });
            redirectFunc(true, "Cập nhật thành công!", rootRoute, req, res);
          }
        } catch (error) {
          redirectFunc(false, "Cập nhật thất bại!", rootRoute, req, res);
        }
      }
    }
  );
  return;
};

module.exports.delete = async (req, res) => {
  let prd_in_used = await Prdreq.find({
    "prDetail.pId": req.params.id,
  }).countDocuments();
  if (prd_in_used == 0) {
    await Product.findByIdAndDelete(req.params.id, function (err) {
      req.session.messages = {
        icon: !err ? "check-circle" : "alert-circle",
        color: !err ? "success" : "danger",
        title: !err ? "Thành công!" : "Thất bại",
        text: !err ? "Xóa sản phẩm thành công!" : "Xóa sản phẩm thất bại!",
      };
      res.json(!err);
    });
  } else {
    req.session.messages = {
      icon: "alert-circle",
      color: "danger",
      title: "Thất bại",
      text: "Không thể xóa sản phẩm đã có yêu cầu bổ sung!",
    };
    res.json(false);
  }
};

module.exports.find = async (req, res) => {
  let keyword = req.body.keyword;
  Product.find({ pName: new RegExp(keyword, "i") }, async (err, products) => {
    res.json(products);
  });
};

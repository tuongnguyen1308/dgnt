const Product = require("../../models/mProduct");
const Roomtype = require("../../models/mRoomtype");
const Category = require("../../models/mCategory");
// const Mtrreq = require("../../models/mMtrreq");
// const MtrBatch = require("../../models/mMtrbatch");
const pI = { title: "Quản lý sản phẩm", url: "product" };
const rootRoute = `/${pI.url}-manager`;

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
  const messages = req.session?.messages || null;
  const sess = req.session.user;
  req.session.messages = null;
  let roomtypes = await Roomtype.find({}).sort({ rtName: "asc" }).populate({
    path: "sId",
    select: "sName",
  });
  let categories = await Category.find({})
    .sort({ pcName: "asc" })
    .populate({
      path: "sId",
      select: "sName",
    })
    .populate({
      path: "rtId",
      select: "rtName",
    });
  let products = await Product.find({}).sort({ pName: "asc" }).populate({
    path: "sId",
    select: "sName",
  });
  // let mtrreqs = await Mtrreq.find({})
  //   .sort({ createdAt: "desc" })
  //   .populate({
  //     path: "mrDetail.mId",
  //     select: "pName mUnit mImg",
  //   })
  //   .populate({
  //     path: "scId",
  //     select: "sName",
  //   })
  //   .populate({
  //     path: "suId",
  //     select: "sName",
  //   });
  // mtrreqs = mtrreqs.map((mtr) => {
  //   let ca = mtr.createdAt;
  //   let ua = mtr.updatedAt;
  //   mtr.createdAt = ca.setUTCHours(ca.getUTCHours() + 7);
  //   mtr.updatedAt = ua.setUTCHours(ua.getUTCHours() + 7);
  //   return mtr;
  // });
  // let mtrbatchs = await MtrBatch.find({})
  //   .populate({ path: "mrId", select: "_id createdAt mrReason mrState" })
  //   .populate({
  //     path: "mbDetail.mId",
  //     select: "pName mUnit mImg",
  //   })
  //   .populate({
  //     path: "sId",
  //     select: "sName",
  //   });
  res.render(`./staff/${pI.url}`, {
    pI,
    messages,
    roomtypes,
    categories,
    products,
    // mtrreqs,
    // mtrbatchs,
    sess,
  });
};

module.exports.add = async (req, res) => {
  // Product.find({ pName: req.body.pName }, async (err, mFound) => {
  //   if (mFound.length > 0) {
  //     redirectFunc(false, "Tên sản phẩm đã tồn tại!", rootRoute, req, res);
  //   } else {
  //     const sess = req.session.user;
  //     try {
  //       let newMaterial = new Product({
  //         pName: req.body.pName,
  //         mDesc: req.body.mDesc,
  //         mUnit: req.body.mUnit,
  //         mStock: 0,
  //         mImg: req.file?.filename || "default.png",
  //         sId: sess.sId,
  //       });
  //       if (newMaterial.pName.length > 50) {
  //         redirectFunc(
  //           false,
  //           "Tên sản phẩm tối đa 50 ký tự!",
  //           rootRoute,
  //           req,
  //           res
  //         );
  //       } else if (newMaterial.mDesc.length > 256) {
  //         redirectFunc(false, "Mô tả tối đa 256 ký tự!", rootRoute, req, res);
  //       } else if (!newMaterial.mImg.match(/\.(jpg|jpeg|png)$/i)) {
  //         redirectFunc(
  //           false,
  //           "Ảnh sản phẩm không hợp lệ!",
  //           rootRoute,
  //           req,
  //           res
  //         );
  //       } else {
  //         await newMaterial.save();
  //         redirectFunc(true, "Thêm sản phẩm thành công!", rootRoute, req, res);
  //       }
  //     } catch (error) {
  //       redirectFunc(false, "Thêm sản phẩm thất bại!", rootRoute, req, res);
  //     }
  //   }
  // });
  // return;
};

module.exports.update = async (req, res) => {
  // let updMaterial = {
  //   pName: req.body.pName,
  //   mDesc: req.body.mDesc,
  //   mUnit: req.body.mUnit,
  // };
  // let mImg = req.file?.filename || false;
  // if (mImg) {
  //   updMaterial.mImg = mImg;
  // }
  // const mFound = await Product.find({
  //   pName: updMaterial.pName,
  //   _id: { $ne: req.body.id },
  // });
  // if (mFound.length > 0) {
  //   redirectFunc(false, "Tên sản phẩm đã tồn tại!", rootRoute, req, res);
  // } else
  //   try {
  //     await Product.findByIdAndUpdate(req.body.id, { $set: updMaterial });
  //     redirectFunc(true, "Cập nhật thành công!", rootRoute, req, res);
  //   } catch (error) {
  //     redirectFunc(false, "Cập nhật thất bại!", rootRoute, req, res);
  //   }
  return;
};

module.exports.delete = async (req, res) => {
  // await Product.findByIdAndDelete(req.params.id, function (err) {
  //   req.session.messages = {
  //     icon: !err ? "check-circle" : "alert-circle",
  //     color: !err ? "success" : "danger",
  //     title: !err ? "Thành công!" : "Thất bại",
  //     text: !err
  //       ? "Xóa sản phẩm thành công!"
  //       : "Xóa sản phẩm thất bại!",
  //   };
  //   res.json(!err);
  // });
};

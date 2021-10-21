const Shopinfo = require("../../models/mShopInfo");
const Order = require("../../models/mOrder");
const State = require("../../models/mState");
const Roomtype = require("../../models/mRoomtype");
const Category = require("../../models/mCategory");

const pI = { title: "Mua hàng", url: "order" };
const rootRoute = `/`;

let menubar = [];

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

let GetDataDisplay = async () => {
  menubar = [];
  shopinfo = await Shopinfo.findOne({});
  //#region menubar
  let categories = await Category.find({}).sort({ pcName: "asc" }).populate({
    path: "rtId",
    select: "rtName slugName",
  });
  categories.map((pc) => {
    let index = menubar.findIndex((mb) => mb.title == pc.rtId.rtName);
    if (index == -1) {
      menubar.push({
        title: pc.rtId.rtName,
        url: "/" + pc.rtId.slugName,
        pcs: [{ title: pc.pcName, url: "/" + pc.slugName }],
      });
    } else {
      menubar[index].pcs.push({
        title: pc.pcName,
        url: "/" + pc.slugName,
      });
    }
  });
  menubar.sort((first, second) => (first.title > second.title ? 1 : -1));
  //#endregion
};

module.exports.index = async (req, res) => {
  const messages = req.session?.messages || null;
  const sess = req.session?.user;
  req.session.messages = null;

  let orders = await Order.find({ cId: sess.cId })
    .populate("products.pId")
    .populate("sdId")
    .populate("pmId")
    .populate("adId");
  //#region lọc đơn hàng theo trạng thái
  let allorders = orders.map((o) => {
    let products = o.products.map((p) => {
      return {
        id: p.pId._id,
        pname: p.pId.pName,
        size: p.pId.pSize,
        price: p.pId.pPrice - (p.pId.pPrice * p.pId.pDiscount) / 100,
        priceDisplay: (
          p.pId.pPrice -
          (p.pId.pPrice * p.pId.pDiscount) / 100
        ).toLocaleString("vi", {
          style: "currency",
          currency: "VND",
        }),
        total:
          (p.pId.pPrice - (p.pId.pPrice * p.pId.pDiscount) / 100) *
          p.odQuantity,
        totalDisplay: (
          (p.pId.pPrice - (p.pId.pPrice * p.pId.pDiscount) / 100) *
          p.odQuantity
        ).toLocaleString("vi", {
          style: "currency",
          currency: "VND",
        }),
        img: "/img/products/" + p.pId.pImgs.find((pi) => pi.piIsMain).piImg,
        url: "/" + p.pId.slugName,
        quantity: p.odQuantity,
        stock: p.pId.pStock,
      };
    });
    let stateName = o.sdId.osName;
    let paidState =
      o.oAmountPaid == 0
        ? "Chờ thanh toán"
        : o.oAmountPaid == o.oTotal
        ? "Đã thanh toán toàn bộ"
        : "Đã thanh toán tiền cọc";
    let totalDisplay = o.oTotal.toLocaleString("vi", {
      style: "currency",
      currency: "VND",
    });
    let amountpaidDisplay = o.oAmountPaid.toLocaleString("vi", {
      style: "currency",
      currency: "VND",
    });
    if (stateName != "Hủy") {
      if (o.gh.sdId) stateName = o.gh.sdId.osName;
      else if (o.sx.sdId) stateName = o.sx.sdId.osName;
      else if (o.bh.sdId) stateName = o.bh.sdId.osName;
    }

    return {
      _id: o._id,
      oId: o.oId,
      total: o.oTotal,
      totalDisplay,
      amountpaid: o.oAmountPaid,
      amountpaidDisplay,
      recdate: o.oRecDate,
      note: o.oNote,
      stateName,
      paidState,
      products: products,
      cId: o.cId,
      adId: o.adId,
      pmId: o.pmId,
      scId: o.scId,
      suId: o.suId,
      bh: o.bh,
      sx: o.sx,
      gh: o.gh,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    };
  });
  // Đã giao hàng
  let dedId = await State.findOne({ osName: "Đã giao hàng" });
  let deliverieds = allorders.filter((o) => o.sdId == dedId._id);
  // Đang giao hàng
  let dingId = await State.findOne({ osName: "Đang giao hàng" });
  let deliverings = allorders.filter((o) => o.gh.sdId == dingId._id);
  // Chờ lấy hàng
  let getingId = await State.findOne({ osName: "Chờ lấy hàng" });
  let getings = allorders.filter((o) => o.sx.sdId == getingId._id);
  // Chờ xử lý
  let pcingId = await State.findOne({ osName: "Chờ xử lý" });
  let processings = allorders.filter((o) => o.bh.sdId == pcingId._id);
  res.render(`./customer/${pI.url}`, {
    pI,
    messages,
    sess,
    allorders,
    deliverieds,
    deliverings,
    getings,
    processings,
    shopinfo: await Shopinfo.findOne({}),
    menubar,
  });
};

// module.exports.update = async (req, res) => {
//   const sess = req.session?.user;

//   let pId = req.body.pId;
//   let pQuantity = req.body.pQuantity;
//   if (pId == "") res.json({ s: false, m: "Sản phẩm là bắt buộc!" });
//   else if (pQuantity <= 0) res.json({ s: false, m: "Số lượng không hợp lệ!" });
//   else if (!sess) res.json({ s: false, m: "Vui lòng đăng nhập!" });
//   else {
//     let cFound = Customer.findOne({ _id: sess.cId }).countDocuments();
//     if (cFound == 0) res.json({ s: false, m: "Tài khoản không hợp lệ!" });
//     else {
//       let pFound = Product.findOne({ _id: pId, pState: true }).select("pStock");
//       if (!pFound) res.json({ s: false, m: "Sản phẩm không hợp lệ!" });
//       else {
//         Cart.findOne({ cId: sess.cId }, async function (err, cartF) {
//           if (!cartF) res.json({ s: false, m: "Giỏ hàng chưa tồn tại!" });
//           else {
//             let pF = false;
//             let products = cartF.products.map((p) => {
//               if (p.pId == pId) {
//                 pF = true;
//                 p.pQuantity = Number(pQuantity);
//               }
//               if (pFound.pStock < p.pQuantity)
//                 res.json({ s: false, m: "Số lượng không hợp lệ!" });
//               return p;
//             });
//             if (!pF) {
//               res.json({ s: false, m: "Sản phẩm không có trong giỏ hàng!" });
//             }
//             cartF.products = products;
//             cartF.save();
//             res.json({ s: true, m: "Cập nhật số lượng thành công!" });
//           }
//         });
//       }
//     }
//   }
// };

// module.exports.remove = async (req, res) => {
//   const sess = req.session?.user;
//   let pId = req.body.pId;
//   if (pId == "") res.json({ s: false, m: "Sản phẩm là bắt buộc!" });
//   else if (!sess) res.json({ s: false, m: "Vui lòng đăng nhập!" });
//   else {
//     let cFound = Customer.findOne({ _id: sess.cId }).countDocuments();
//     if (cFound == 0) res.json({ s: false, m: "Tài khoản không hợp lệ!" });
//     else {
//       let pFound = Product.findOne({ _id: pId, pState: true });
//       if (!pFound) res.json({ s: false, m: "Sản phẩm không hợp lệ!" });
//       else {
//         Cart.findOne({ cId: sess.cId }, async function (err, cartF) {
//           try {
//             if (!cartF) res.json({ s: false, m: "Giỏ hàng chưa tồn tại!" });
//             else {
//               let pF = false;
//               let products = cartF.products.filter((p) => p.pId != pId);
//               cartF.products = products;
//               cartF.save();
//               res.json({ s: true, d: cartF });
//             }
//           } catch (error) {
//             res.json({ s: false, m: error });
//           }
//         });
//       }
//     }
//   }
// };

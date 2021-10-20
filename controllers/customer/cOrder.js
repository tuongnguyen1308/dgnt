const Shopinfo = require("../../models/mShopInfo");
const Customer = require("../../models/mCustomer");
const DA = require("../../models/mDeliveryAddress");
const PM = require("../../models/mPaymentMethod");
const Order = require("../../models/mOrder");

const pI = { title: "Mua hàng", url: "order" };
const rootRoute = `/`;

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
  const sess = req.session?.user;
  req.session.messages = null;

  let orders = await Order.findOne({ cId: sess.cId })
    .populate("products.pId")
    .populate("pmId")
    .populate("adId");
  console.log(orders);
  res.render(`./customer/${pI.url}`, {
    pI,
    messages,
    sess,
    shopinfo: await Shopinfo.findOne({}),
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

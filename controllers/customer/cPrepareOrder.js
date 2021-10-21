const Shopinfo = require("../../models/mShopInfo");
const Product = require("../../models/mProduct");
const Customer = require("../../models/mCustomer");
const Cart = require("../../models/mCart");
const DA = require("../../models/mDeliveryAddress");
const PM = require("../../models/mPaymentMethod");
const Order = require("../../models/mOrder");
const State = require("../../models/mState");
const Role = require("../../models/mRole");
const col_states = require("../../data/col_states.json");

const pI = { title: "Mua hàng", url: "prepareorder" };
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

const checkDB = async () => {
  let rs = await Role.find({});
  await State.find({}, (err, states) => {
    if (states.length == 0) {
      col_states.map(async (s) => {
        let roles = s.rName.map((rName) => {
          return { rId: rs.find((r) => r.rName == rName).rId };
        });
        let newState = new State({
          osName: s.osName,
          roles,
        });
        await newState.save();
      });
    }
  });
};

module.exports.index = async (req, res) => {
  const messages = req.session?.messages || null;
  const sess = req.session?.user;
  req.session.messages = null;
  checkDB();
  let cart = await Cart.findOne({ cId: sess.cId }).populate("products.pId");
  if (cart) {
    let cartPrdQuan = 0;
    let total = 0;
    let prds = cart.products.map((p) => {
      cartPrdQuan += p.pQuantity;
      total +=
        (p.pId.pPrice - (p.pId.pPrice * p.pId.pDiscount) / 100) * p.pQuantity;
      return {
        id: p.pId._id,
        pname: p.pId.pName,
        price: p.pId.pPrice - (p.pId.pPrice * p.pId.pDiscount) / 100,
        priceDisplay: (
          p.pId.pPrice -
          (p.pId.pPrice * p.pId.pDiscount) / 100
        ).toLocaleString("vi", {
          style: "currency",
          currency: "VND",
        }),
        total:
          (p.pId.pPrice - (p.pId.pPrice * p.pId.pDiscount) / 100) * p.pQuantity,
        totalDisplay: (
          (p.pId.pPrice - (p.pId.pPrice * p.pId.pDiscount) / 100) *
          p.pQuantity
        ).toLocaleString("vi", {
          style: "currency",
          currency: "VND",
        }),
        img: "/img/products/" + p.pId.pImgs.find((pi) => pi.piIsMain).piImg,
        url: "/" + p.pId.slugName,
        quantity: p.pQuantity,
        stock: p.pId.pStock,
      };
    });
    total = total.toLocaleString("vi", {
      style: "currency",
      currency: "VND",
    });
    let das = await DA.find({ cId: sess.cId });
    res.render(`./customer/${pI.url}`, {
      pI,
      messages,
      sess,
      shopinfo: await Shopinfo.findOne({}),
      das,
      pms: await PM.find({}),
      prds,
      cartPrdQuan,
      total,
    });
  } else {
    redirectFunc(false, "Chưa có sản phẩm trong giỏ hàng!", "/", req, res);
  }
};

module.exports.add = async (req, res) => {
  const sess = req.session?.user;
  if (!sess) res.json({ s: false, m: "Vui lòng đăng nhập!" });
  else {
    let cFound = await Customer.findById(sess.cId).populate("aId");
    if (!cFound) res.json({ s: false, m: "Tài khoản không hợp lệ!" });
    else {
      Cart.findOne({ cId: sess.cId })
        .populate("products.pId")
        .exec(async function (err, cartF) {
          if (!cartF) res.json({ s: false, m: "Chưa có giỏ hàng!" });
          else {
            let enoughP = true;
            let oTotal = 0;
            let products = cartF.products.map((p) => {
              if (p.pQuantity < p.pId.pStock) {
                let odPrice =
                  p.pId.pPrice - (p.pId.pPrice * p.pId.pDiscount) / 100;
                oTotal += odPrice * p.pQuantity;
                return {
                  pId: p.pId._id,
                  odQuantity: p.pQuantity,
                  odPrice,
                };
              } else enoughP = false;
            });
            if (!enoughP)
              res.json({ s: false, m: "Không đủ số lượng sản phẩm!" });
            else {
              let curD = new Date();
              let oId = `HD${curD.getFullYear()}${
                curD.getMonth() + 1
              }${curD.getDate()}${curD.getHours()}${curD.getMinutes()}${curD.getSeconds()}_${
                cFound.aId.aUsername
              }`;
              let newOrder = new Order({
                oId,
                oTotal,
                oAmountPaid: 0,
                oNote: req.body.oNote,
                sdId: await State.findOne({ osName: "Đã tạo đơn hàng" }),
                products,
                cId: cFound._id,
                adId: req.body.adId,
                pmId: req.body.pmId,
              });
              let createOrderStatus = await newOrder.save();
              if (createOrderStatus) {
                await Cart.deleteOne({ cId: sess.cId });
              }
              redirectFunc(
                true,
                "Tạo đơn hàng thành công!",
                rootRoute,
                req,
                res
              );
              // res.json({ s: true, m: "Tạo đơn hàng thành công!" });
            }
          }
        });
    }
  }
};

const Shopinfo = require("../../models/mShopInfo");
const Product = require("../../models/mProduct");
const Customer = require("../../models/mCustomer");
const Cart = require("../../models/mCart");

const pI = { title: "Giỏ hàng", url: "cart" };

let shopinfo;
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

module.exports.index = async (req, res) => {
  const messages = req.session?.messages || null;
  const sess = req.session?.user;
  req.session.messages = null;
  let shopinfo = await Shopinfo.findOne({});

  let cart = await Cart.findOne({ cId: sess.cId }).populate("products.pId");
  let prds = [];
  let total = 0;
  if (cart) {
    prds = cart.products.map((p) => {
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
  }
  total = total.toLocaleString("vi", {
    style: "currency",
    currency: "VND",
  });

  res.render(`./customer/${pI.url}`, {
    pI,
    messages,
    sess,
    shopinfo,
    prds,
    total,
  });
};

module.exports.add = async (req, res) => {
  const sess = req.session?.user;

  let pId = req.body.pId;
  let pQuantity = req.body.pQuantity;

  if (pId == "") res.json({ s: false, m: "Sản phẩm là bắt buộc!" });
  else if (pQuantity <= 0) res.json({ s: false, m: "Số lượng không hợp lệ!" });
  else if (!sess) res.json({ s: false, m: "Vui lòng đăng nhập!" });
  else {
    let cFound = Customer.findOne({ _id: sess.cId }).countDocuments();
    if (cFound == 0) res.json({ s: false, m: "Tài khoản không hợp lệ!" });
    else {
      let pFound = Product.findOne({ _id: pId, pState: true }).select("pStock");
      if (!pFound) res.json({ s: false, m: "Sản phẩm không hợp lệ!" });
      else if (pFound.pStock < pQuantity)
        res.json({ s: false, m: "Số lượng không hợp lệ!" });
      else {
        Cart.findOne({ cId: sess.cId }, async function (err, cartF) {
          try {
            if (!cartF) {
              let newCart = new Cart({
                cId: sess.cId,
                products: { pId, pQuantity },
              });
              await newCart.save();
              res.json({ s: true, d: newCart });
            } else {
              let pF = false;
              let products = cartF.products.map((p) => {
                if (p.pId == pId) {
                  pF = true;
                  p.pQuantity = Number(p.pQuantity) + Number(pQuantity);
                }
                return p;
              });
              if (!pF) {
                products.push({ pId, pQuantity });
              }
              cartF.products = products;
              cartF.save();
              res.json({ s: true, d: cartF });
            }
          } catch (error) {
            res.json({ s: false, m: error });
          }
        });
      }
    }
  }
};

const Shopinfo = require("../../models/mShopInfo");
const Order = require("../../models/mOrder");
const State = require("../../models/mState");
const Cart = require("../../models/mCart");
const Category = require("../../models/mCategory");
const pI = { title: "Đơn đặt hàng", url: "order" };
const rootRoute = `/${pI.url}`;

let menubar = [];

let cartPrdQuan = 0;

let formatDateTime = (d) => {
  d.setUTCHours(d.getUTCHours() + 7);
  return (
    d.toISOString().slice(0, 10).split("-").reverse().join("/") +
    " " +
    d.toISOString().slice(11, 19)
  );
};

let formatDate = (d) => {
  d.setUTCHours(d.getUTCHours() + 7);
  return d.toISOString().slice(0, 10).split("-").reverse().join("/");
};

let redirFunc = (state, text, dir, req, res) => {
  req.session.messages = {
    icon: state ? "check-circle" : "alert-circle",
    color: state ? "success" : "danger",
    title: state ? "Thành công" : "Thất bại",
    text,
  };
  res.redirect(dir);
  return;
};

let GetDataDisplay = async (sess) => {
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
  //#region số lượng sản phẩm trong cart
  if (sess) {
    await Cart.findOne({ cId: sess.cId }, function (err, cart) {
      if (cart)
        cartPrdQuan = cart.products.reduce((pp, np) => {
          return Number(pp) + Number(np.pQuantity);
        }, 0);
    });
  }
  //#endregion
};

module.exports.index = async (req, res) => {
  const messages = req.session?.messages || null;
  const sess = req.session?.user;
  req.session.messages = null;
  GetDataDisplay(sess);
  let orders = await Order.find({ cId: sess.cId })
    .sort({ createdAt: "desc" })
    .populate("products.pId")
    .populate("sdId")
    .populate("scId")
    .populate("suId")
    .populate("pmId")
    .populate("bh.sId")
    .populate("bh.sdId")
    .populate("sx.sId")
    .populate("sx.sdId")
    .populate("gh.sId")
    .populate("gh.sdId")
    .populate("cId")
    .populate("adId");
  // get product-request
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
    if (!["Hủy", "Đã nhận hàng"].includes(stateName)) {
      if (o.gh.sdId) stateName = o.gh.sdId.osName;
      else if (o.sx.sdId) stateName = o.sx.sdId.osName;
      else if (o.bh.sdId) stateName = o.bh.sdId.osName;
    }
    let bh = {};
    let sx = {};
    let gh = {};
    if (o.bh.sdId) {
      bh.sId = o.bh.sId;
      bh.sdId = o.bh.sdId;
      bh.oNote = o.bh.oNote;
      bh.ouUpdateAt = formatDateTime(o.bh.ouUpdateAt);
    }
    if (o.sx.sdId) {
      sx.sId = o.sx.sId;
      sx.sdId = o.sx.sdId;
      sx.oNote = o.sx.oNote;
      sx.ouUpdateAt = formatDateTime(o.sx.ouUpdateAt);
    }
    if (o.gh.sdId) {
      gh.sId = o.gh.sId;
      gh.sdId = o.gh.sdId;
      gh.oNote = o.gh.oNote;
      gh.ouUpdateAt = formatDateTime(o.gh.ouUpdateAt);
    }
    return {
      _id: o._id,
      oId: o.oId,
      total: o.oTotal,
      totalDisplay,
      amountpaid: o.oAmountPaid,
      amountpaidDisplay,
      recdate: o.oRecDate ? formatDate(o.oRecDate) : "",
      note: o.oNote,
      stateName,
      paidState,
      products: products,
      cId: o.cId,
      adId: o.adId,
      pmId: o.pmId,
      scId: o.scId,
      suId: o.suId,
      sdId: o.sdId,
      bh: bh,
      sx: sx,
      gh: gh,
      createdAt: formatDateTime(o.createdAt),
      updatedAt: o.updatedAt && formatDateTime(o.updatedAt),
    };
  });
  // Đã giao hàng
  let states = await State.find({});
  let dagiaoId = states.find((s) => s.osName == "Đã giao hàng")._id;
  let danhanId = states.find((s) => s.osName == "Đã nhận hàng")._id;
  let o_deds = [];
  // Đang giao hàng
  let dacbId = states.find((s) => s.osName == "Đã chuẩn bị hàng")._id;
  let o_dings = [];
  // Chờ chuẩn bị hàng
  let datnId = states.find((s) => s.osName == "Đã tiếp nhận")._id;
  let o_gings = [];
  // Chờ xử lý
  let dataoId = states.find((s) => s.osName == "Đã tạo đơn hàng")._id;
  let o_pings = [];
  // Hủy
  let huyId = states.find((s) => s.osName == "Hủy")._id;
  let o_ceds = [];
  allorders.map((o) => {
    if (["Đã giao hàng", "Đã nhận hàng"].includes(o.stateName)) o_deds.push(o);
    else if (o.stateName == "Đã chuẩn bị hàng") o_dings.push(o);
    else if (o.stateName == "Đã tiếp nhận") o_gings.push(o);
    else if (o.stateName == "Hủy") o_ceds.push(o);
    else o_pings.push(o);
  });
  res.render(`./customer/${pI.url}`, {
    pI,
    messages,
    sess,
    o_deds,
    o_dings,
    o_gings,
    o_pings,
    o_ceds,
    huyId,
    danhanId,
    shopinfo: await Shopinfo.findOne({}),
    menubar,
    cartPrdQuan,
  });
};

module.exports.updateState = async (req, res) => {
  await Order.findById(req.body.oId, async (err, o) => {
    if (!o) redirFunc(false, "Không tìm thấy đơn hàng", rootRoute, req, res);
    else {
      o.sdId = req.body.sdId;
      o.oNote = req.body.oNote.trim();
      o.updatedAt = new Date();
      await o.save((err) => {
        err &&
          redirFunc(false, "Cập nhật thất bại!" + err, rootRoute, req, res);
        redirFunc(true, "Cập nhật thành công!", rootRoute, req, res);
      });
    }
  });
};

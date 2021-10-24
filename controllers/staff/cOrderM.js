const Order = require("../../models/mOrder");
const State = require("../../models/mState");
const PM = require("../../models/mPaymentMethod");
const DA = require("../../models/mDeliveryAddress");
const Customer = require("../../models/mCustomer");
const Product = require("../../models/mProduct");
const pI = { title: "Đơn đặt hàng", url: "orderM" };
const rootRoute = `/${pI.url}`;
const PAGE_SIZE = 10;

let formatDate = (d) => {
  d.setUTCHours(d.getUTCHours() + 7);
  return (
    d.toISOString().slice(0, 10).split("-").reverse().join("/") +
    " " +
    d.toISOString().slice(11, 19)
  );
};

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
  //#region pagination
  // let pageNum = Math.max(req.query.pnum || 1, 1);
  // let skipPageP = (pageNum - 1) * PAGE_SIZE;
  //#endregion
  // filter/search
  let con = {};
  let keyword = req.query?.oId || "";
  if (keyword) con.oId = new RegExp(keyword, "i");
  // find products with condition
  // let totalO = await Order.countDocuments();
  // let totalOP = Math.ceil(totalO / PAGE_SIZE);
  let orders = await Order.find(con)
    // .skip(skipPageP)
    // .limit(PAGE_SIZE)
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
    if (stateName != "Hủy") {
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
      bh.ouUpdateAt = formatDate(o.bh.ouUpdateAt);
    }
    if (o.sx.sdId) {
      sx.sId = o.sx.sId;
      sx.sdId = o.sx.sdId;
      sx.oNote = o.sx.oNote;
      sx.ouUpdateAt = formatDate(o.sx.ouUpdateAt);
    }
    if (o.gh.sdId) {
      gh.sId = o.gh.sId;
      gh.sdId = o.gh.sdId;
      gh.oNote = o.gh.oNote;
      gh.ouUpdateAt = formatDate(o.gh.ouUpdateAt);
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
      sdId: o.sdId,
      bh: bh,
      sx: sx,
      gh: gh,
      createdAt: formatDate(o.createdAt),
      updatedAt: o.updatedAt && formatDate(o.updatedAt),
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
  res.render(`./staff/${pI.url}`, {
    pI,
    messages,
    o_deds,
    o_dings,
    o_gings,
    o_pings,
    o_ceds,
    huyId,
    datnId,
    dacbId,
    dagiaoId,
    danhanId,
    pms: await PM.find({}),
    keyword,
    sess,
    // pageNum,
    // totalO,
    // totalOP,
    // PAGE_SIZE,
  });
};

module.exports.find = async (req, res) => {
  let cId = req.body.cId;
  await DA.find({ cId }, async (err, das) => {
    res.json(das);
  });
};

module.exports.add = async (req, res) => {
  const sess = req.session.user;
  let cId = req.body.cId;
  let cFound = await Customer.findById(cId).populate({
    path: "aId",
    select: "aUsername",
  });
  if (!cFound) res.json({ s: false, m: "Tài khoản không hợp lệ!" });
  else {
    //#region tạo Mã hóa đơn
    let curD = new Date();
    let oId = `HD${curD.getFullYear()}${
      curD.getMonth() + 1
    }${curD.getDate()}${curD.getHours()}${curD.getMinutes()}${curD.getSeconds()}_${
      cFound.aId.aUsername
    }`;
    //#endregion
    //#region tạo dữ liệu sản phẩm
    let products = [];
    let pIds = req.body.pId;
    let odQuantitys = req.body.odQuantity;
    let odPrices = req.body.odPrice;
    if (typeof pIds === "string") {
      pIds = [pIds];
      odQuantitys = [odQuantitys];
      odPrices = [odPrices];
    }
    pIds.map((pId, index) => {
      products.push({
        pId,
        odQuantity: odQuantitys[index],
        odPrice: odPrices[index],
      });
    });
    //#endregion
    let newOrder = new Order({
      oId,
      cId: req.body.cId,
      adId: req.body.adId,
      pmId: req.body.pmId,
      products,
      oTotal: req.body.oTotal,
      oAmountPaid: 0,
      oNote: req.body.oNote.trim(),
      sdId: await State.findOne({ osName: "Đã tạo đơn hàng" }),
      scId: sess.sId,
      createdAt: curD,
    });
    await newOrder.save((err) => {
      redirectFunc(
        !err,
        !err
          ? "Tạo đơn đặt hàng thành công!"
          : "Tạo đơn đặt hàng thất bại!" + err,
        rootRoute,
        req,
        res
      );
    });
  }
};

module.exports.updateState = async (req, res) => {
  const sess = req.session.user;
  let oId = req.body.oId;
  let oRecDate = req.body.oRecDate;
  await Order.findById(oId, async (err, o) => {
    if (!o) redirectFunc(false, "Không tìm thấy đơn hàng", rootRoute, req, res);
    else if (oRecDate && new Date(oRecDate).getTime() < new Date().getTime())
      redirectFunc(false, "Ngày nhập không hợp lệ!", rootRoute, req, res);
    else {
      let sdId = req.body.sdId;
      let sn = req.body.sn;
      let nvud = {
        sId: sess.sId,
        oNote: req.body.oNote.trim(),
        ouUpdateAt: new Date(),
        sdId,
      };
      o[sn] = nvud;
      let enoughPrd = true;
      if (sn == "sx") {
        o.products.map(async (p) => {
          await Product.findById(p.pId, async (err, prd) => {
            prd.pStock -= p.odQuantity;
            if (enoughPrd && prd.pStock < 0) enoughPrd = false;
            else await prd.save();
          });
        });
      }
      if (enoughPrd)
        await o.save((err) => {
          err &&
            redirectFunc(
              false,
              "Cập nhật thất bại!" + err,
              rootRoute,
              req,
              res
            );
          redirectFunc(true, "Cập nhật thành công!", rootRoute, req, res);
        });
      else redirectFunc(false, "Cập nhật thất bại!" + err, rootRoute, req, res);
    }
  });
};

module.exports.updateMoney = async (req, res) => {
  const sess = req.session.user;
  let oId = req.body.oId;
  await Order.findById(oId, async (err, o) => {
    if (!o) redirectFunc(false, "Không tìm thấy đơn hàng", rootRoute, req, res);
    else {
      o.suId = sess.sId;
      o.oAmountPaid = req.body.oAmountPaid;
      o.updatedAt = new Date();
      await o.save((err) => {
        err &&
          redirectFunc(false, "Cập nhật thất bại!" + err, rootRoute, req, res);
        redirectFunc(true, "Cập nhật thành công!", rootRoute, req, res);
      });
    }
  });
};

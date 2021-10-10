const Shopinfo = require("../../models/mShopInfo");
const Account = require("../../models/mAccount");
const Roomtype = require("../../models/mRoomtype");
const Category = require("../../models/mCategory");
const Product = require("../../models/mProduct");
const Banner = require("../../models/mBanner");

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
  await GetDataDisplay();
  let roomtypes = await Roomtype.find({}).sort({ rtName: "asc" });

  //#region products
  let groupPrdByRt = [];
  let products = await Product.find({ pState: true })
    .sort({ createdAt: "desc" })
    .populate({
      path: "pcId",
      select: "rtId slugName",
      populate: { path: "rtId", select: "rtName slugName" },
    });
  products.map((p) => {
    let prd = {
      title: p.pName,
      disc: p.pDiscount,
      price: p.pPrice.toLocaleString("vi", {
        style: "currency",
        currency: "VND",
      }),
      priceAfter: (
        p.pPrice -
        Math.floor(p.pPrice * p.pDiscount) / 100
      ).toLocaleString("vi", { style: "currency", currency: "VND" }),
      img: p.pImgs.find((pi) => pi.piIsMain).piImg,
      url: "/" + p.slugName,
      pcUrl: "/" + p.pcId.slugName,
    };
    let rtTitle = p.pcId.rtId.rtName;
    let rtUrl = "/" + p.pcId.rtId.slugName;
    let index = groupPrdByRt.findIndex((rt) => rt.title == rtTitle);
    if (index == -1) {
      groupPrdByRt.push({
        title: rtTitle,
        url: rtUrl,
        pcs: menubar.find((mb) => mb.title == rtTitle).pcs,
        ps: [prd],
      });
    } else {
      if (groupPrdByRt[index].ps.length < 6) {
        groupPrdByRt[index].ps.push(prd);
      }
    }
  });
  //#endregion
  // banner
  let banners = await Banner.find({}).sort({ bNumber: "asc" });
  res.render(`./customer/${pI.url}`, {
    pI,
    messages,
    sess,
    shopinfo,
    menubar,
    banners,
    roomtypes,
    groupPrdByRt,
    products,
  });
};

module.exports.filter = async (req, res) => {
  const messages = req.session?.messages || null;
  const sess = req.session?.user;
  req.session.messages = null;

  await GetDataDisplay();
  let keyword = req.params.keyword;
  let pcFound;
  let rtFound = await Roomtype.findOne({
    slugName: keyword,
  });

  if (!rtFound) {
    pcFound = await Category.findOne({ slugName: keyword });
    if (pcFound) {
      rtFound = await Roomtype.findById(pcFound.rtId);
    } else {
      //#region PRODUCT DETAIL PAGE
      let pFound = await Product.findOne({ slugName: keyword }).populate({
        path: "pcId",
        populate: { path: "rtId" },
      });
      if (!pFound) {
        redirectFunc(false, "Không tìm thấy trang yêu cầu", "/", req, res);
        return;
      }
      let prd = {
        _id: pFound._id,
        name: pFound.pName,
        unit: pFound.pUnit,
        size: pFound.pSize,
        stock: pFound.pStock,
        price: pFound.pPrice.toLocaleString("vi", {
          style: "currency",
          currency: "VND",
        }),
        disc: pFound.pDiscount,
        priceAfter: (
          pFound.pPrice -
          Math.floor(pFound.pPrice * pFound.pDiscount) / 100
        ).toLocaleString("vi", { style: "currency", currency: "VND" }),
        img: pFound.pImgs.find((pi) => pi.piIsMain).piImg,
        url: "/" + pFound.slugName,
        desc: pFound.pDesc,
        pImgs: pFound.pImgs,
        pcId: pFound.pcId,
      };

      let relatePrdFound = await Product.find({
        pcId: pFound.pcId._id,
        _id: { $ne: pFound._id },
      }).limit(4);
      let relatePrd = relatePrdFound.map((p) => {
        let pformat = {
          title: p.pName,
          disc: p.pDiscount,
          price: p.pPrice.toLocaleString("vi", {
            style: "currency",
            currency: "VND",
          }),
          priceAfter: (
            p.pPrice -
            Math.floor(p.pPrice * p.pDiscount) / 100
          ).toLocaleString("vi", { style: "currency", currency: "VND" }),
          img: p.pImgs.find((pi) => pi.piIsMain).piImg,
          url: "/" + p.slugName,
          pcUrl: "/" + p.pcId.slugName,
        };
        return pformat;
      });

      res.render(`./customer/productdetail`, {
        pI,
        messages,
        sess,
        shopinfo,
        menubar,
        prd,
        relatePrd,
      });
      return;
      //#endregion
    }
  }

  let pcFounds = await Category.find({ rtId: rtFound._id }).sort({
    pcName: "asc",
  });
  let pcArr = pcFounds.map((pc) => pc._id);
  if (pcFound) {
    pcArr = [];
    pcArr.push(pcFound._id);
  }
  let pFounds = await Product.find({ pcId: { $in: pcArr }, pState: true })
    .sort({
      pName: "asc",
    })
    .populate({
      path: "pcId",
      select: "rtId slugName",
      populate: { path: "rtId", select: "slugName" },
    });
  let prds = pFounds.map((p) => {
    let prd = {
      title: p.pName,
      disc: p.pDiscount,
      price: p.pPrice.toLocaleString("vi", {
        style: "currency",
        currency: "VND",
      }),
      priceAfter: (
        p.pPrice -
        Math.floor(p.pPrice * p.pDiscount) / 100
      ).toLocaleString("vi", { style: "currency", currency: "VND" }),
      img: p.pImgs.find((pi) => pi.piIsMain).piImg,
      url: "/" + p.slugName,
      pcUrl: "/" + p.pcId.slugName,
    };
    return prd;
  });

  res.render(`./customer/filter`, {
    pI,
    messages,
    sess,
    shopinfo,
    menubar,
    rtFound,
    pcFounds,
    pcFound,
    prds,
  });
};

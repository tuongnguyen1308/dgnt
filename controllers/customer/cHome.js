const Shopinfo = require("../../models/mShopInfo");
const Roomtype = require("../../models/mRoomtype");
const Category = require("../../models/mCategory");
const Product = require("../../models/mProduct");
const Banner = require("../../models/mBanner");
const Cart = require("../../models/mCart");
const Review = require("../../models/mReview");
const Order = require("../../models/mOrder");
const PAGE_SIZE = 9;

const pI = { title: "Trang chủ", url: "home" };

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

let formatDateTime = (d) => {
  d.setUTCHours(d.getUTCHours() + 7);
  return (
    d.toISOString().slice(0, 10).split("-").reverse().join("/") +
    " " +
    d.toISOString().slice(11, 19)
  );
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
  let cartPrdQuan = 0;
  if (sess) {
    await Cart.findOne({ cId: sess.cId }, function (err, cart) {
      if (cart)
        cartPrdQuan = cart.products.reduce(
          (pp, np) => Number(pp) + Number(np.pQuantity),
          0
        );
    });
  }

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
    cartPrdQuan,
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

  let cartPrdQuan = 0;
  if (sess) {
    await Cart.findOne({ cId: sess.cId }, function (err, cart) {
      if (cart)
        cartPrdQuan = cart.products.reduce((pp, np) => {
          return Number(pp) + Number(np.pQuantity);
        }, 0);
    });
  }
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
        imgMain: pFound.pImgs.find((pi) => pi.piIsMain).piImg,
        imgSub: pFound.pImgs.filter((pi) => !pi.piIsMain),
        url: "/" + pFound.slugName,
        desc: pFound.pDesc,
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
      let buyed = false;
      let reviews = await Review.find({ pId: prd._id }).populate({
        path: "cId",
        select: "_id cName cImg",
      });
      let reviewed = false;
      if (sess) {
        let oFs = await Order.find({
          "products.pId": prd._id,
          cId: sess.cId,
        })
          .populate("sdId")
          .populate("bh.sdId");

        if (oFs.length > 0) {
          buyed =
            oFs.filter(
              (o) => o.sdId.osName != "Hủy" && o.bh?.sdId?.osName != "Hủy"
            ).length > 0;
        }
        reviews = reviews.map((r) => {
          let rv = {
            _id: r._id,
            rScore: r.rScore,
            rContent: r.rContent,
            rState: r.rState,
            imgs: r.imgs,
            pId: r.pId,
            cId: r.cId,
            rAt: formatDateTime(r.rAt),
          };
          if (r.cId._id == sess.cId) {
            reviewed = rv;
            return rv;
          }
          if (r.rState) return rv;
          else return false;
        });
        reviews = reviews.filter((r) => r != false);
      }
      res.render(`./customer/productdetail`, {
        pI,
        messages,
        sess,
        shopinfo,
        menubar,
        cartPrdQuan,
        prd,
        relatePrd,
        reviews,
        buyed,
        reviewed,
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
  //#region pagination
  let pageNum = Math.max(req.query.pnum || 1, 1);
  let skipPage = (pageNum - 1) * PAGE_SIZE;
  let totalPrd = await Product.find({
    pcId: { $in: pcArr },
    pState: true,
  }).countDocuments();
  let totalPage = Math.ceil(totalPrd / PAGE_SIZE);
  //#endregion
  let pFounds = await Product.find({ pcId: { $in: pcArr }, pState: true })
    .sort({
      pName: "asc",
    })
    .skip(skipPage)
    .limit(PAGE_SIZE)
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
    cartPrdQuan,
    rtFound,
    pcFounds,
    pcFound,
    prds,
    pageNum,
    totalPrd,
    totalPage,
    keyword,
    pageSize: PAGE_SIZE,
  });
};

module.exports.find = async (req, res) => {
  let keyword = req.body.keyword;
  Product.find({ pName: new RegExp(keyword, "i") }, async (err, products) => {
    res.json(products);
  });
};

module.exports.addReview = async (req, res) => {
  let prevUrl = req.headers.referer;
  let prevPage = `/${prevUrl.split("/").pop()}`;
  let sess = req.session?.user;
  Review.find({ pId: req.body.pId, cId: sess.cId }, async (err, rFound) => {
    if (rFound.length > 0) {
      redirectFunc(false, "Sản phẩm đã được đánh giá!", prevPage, req, res);
    } else {
      // review imgs
      let imgs = [];
      req.files.riImg.map((img) => {
        imgs.push({
          riImg: img.filename,
        });
      });
      let newReview = new Review({
        rScore: req.body.rScore,
        rContent: req.body.rContent.trim(),
        rState: true,
        imgs,
        pId: req.body.pId,
        cId: sess.cId,
        rAt: new Date(),
      });
      try {
        if (newReview.rContent.length > 255) {
          redirectFunc(false, "Nội dung tối đa 255 ký tự!", prevPage, req, res);
        } else {
          await newReview.save();
          redirectFunc(
            true,
            "Đánh giá sản phẩm thành công!",
            prevPage,
            req,
            res
          );
        }
      } catch (error) {
        console.log(error);
        redirectFunc(
          false,
          "Thêm đánh giá thất bại!" + error,
          prevPage,
          req,
          res
        );
      }
    }
  });
  return;
};

module.exports.updReview = async (req, res) => {
  let prevUrl = req.headers.referer;
  let prevPage = `/${prevUrl.split("/").pop()}`;
  let rFound = await Review.findById(req.body._id);
  if (!rFound) redirectFunc(false, "Chưa tạo đánh giá!", prevPage, req, res);
  else {
    if (req.files?.riImg) {
      let imgs = [];
      req.files.riImg.map((img) => {
        imgs.push({
          riImg: img.filename,
        });
      });
      rFound.imgs = imgs;
    }
    rFound.rScore = req.body.rScore;
    rFound.rContent = req.body.rContent.trim();
    if (rFound.rContent.length > 255)
      redirectFunc(false, "Nội dung tối đa 255 ký tự!", prevPage, req, res);
    else {
      await rFound.save();
      redirectFunc(true, "Cập nhật thành công!", prevPage, req, res);
    }
  }
};

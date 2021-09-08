const Account = require("../../models/mAccount");
const Banner = require("../../models/mBanner");
const PaymentMethod = require("../../models/mPaymentMethod");
const ShopInfo = require("../../models/mShopInfo");
const curPage = "about";
const rootRoute = `/${curPage}`;
const imgViewWeight = 970;
const imgViewHeight = 250;

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
  const title = "Quản lý danh mục";
  const messages = req.session?.messages || null;
  const sess = req.session.user;
  req.session.messages = null;

  if (sess.rId.rName != "Quản lý") {
    redirectFunc(
      false,
      "Bạn không có quyền truy cập chứcn năng này!",
      "dashboard",
      req,
      res
    );
  }

  let banners = await Banner.find({})
    .sort({ bNumber: "asc" })
    .populate({ path: "aId" });
  let paymentMethods = await PaymentMethod.find({}).populate({ path: "aId" });
  let shopInfo = await ShopInfo.find({}).populate({ path: "aId" });
  res.render(`./staff/${curPage}`, {
    title,
    curPage,
    messages,
    banners,
    paymentMethods,
    shopInfo,
    imgViewWeight,
    imgViewHeight,
    sess,
  });
};
//#region banner
module.exports.bannerAdd = async (req, res) => {
  let numOfBanner = await Banner.countDocuments();
  const sess = req.session.user;
  let newBanner = new Banner({
    bImg: req.file.filename,
    bNumber: numOfBanner + 1,
    sId: sess.sId,
  });
  try {
    await newBanner.save();
    redirectFunc(true, "Thêm thành công!", rootRoute, req, res);
  } catch (error) {
    redirectFunc(false, "Thêm thất bại!", rootRoute, req, res);
  }
};

module.exports.bannerUpdate = async (req, res) => {
  let listBanner = req.body;
  try {
    listBanner.forEach(async (banner) => {
      await Banner.findOneAndUpdate(
        { bNumber: banner.bNumber },
        { $set: banner }
      );
    });
    res.json({ result: true, err: null });
  } catch (error) {
    res.json(error);
  }
};

module.exports.bannerDelete = async (req, res) => {
  let numOfBanner = await Banner.countDocuments();
  let bannerDeleted = await Banner.findOne(
    { bImg: req.params.id },
    async (err) => {
      await Banner.findOneAndDelete({ bImg: req.params.id }, async (err) => {
        for (let i = bannerDeleted.bNumber; i <= numOfBanner; i++) {
          await Banner.findOneAndUpdate(
            { bNumber: i },
            { $set: { bNumber: i - 1 } },
            (err) => err && console.log(err)
          );
        }
        res.json({ result: !err, err });
      });
    }
  );
};
//#endregion

//#region payment method

//#endregion

//#region shop info

//#endregion

const Account = require("../../models/mAccount");
const Banner = require("../../models/mBanner");
const PaymentMethod = require("../../models/mPaymentMethod");
const ShopInfo = require("../../models/mShopInfo");
const pI = { title: "Quản lý danh mục", url: "about" };
const rootRoute = `/${pI.url}`;
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
  let shopInfo = await ShopInfo.findOne({}).populate({ path: "aId" });
  res.render(`./staff/${pI.url}`, {
    pI,
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
module.exports.pmAdd = async (req, res) => {
  const sess = req.session.user;
  let newPM = new PaymentMethod({
    pmName: req.body.pmName,
    pmDesc: req.body.pmDesc,
    pmState: req.body.pmState == "on",
    sId: sess.sId,
  });
  try {
    await newPM.save();
    redirectFunc(true, "Thêm thành công!", rootRoute, req, res);
  } catch (error) {
    redirectFunc(false, "Thêm thất bại!", rootRoute, req, res);
  }
};
module.exports.pmUpdate = async (req, res) => {
  let sess = req.session.user;
  let updPM = {
    pmName: req.body.pmName,
    pmDesc: req.body.pmDesc,
    pmState: req.body.pmState == "on",
    sId: sess.sId,
  };
  await PaymentMethod.findByIdAndUpdate(req.body.id, { $set: updPM }, (err) => {
    redirectFunc(
      !err,
      !err ? "Cập nhật thành công!" : "Cập nhật thất bại!",
      rootRoute,
      req,
      res
    );
  });
};
module.exports.pmDelete = async (req, res) => {
  await PaymentMethod.findByIdAndDelete(req.params.id, (err) => {
    req.session.messages = {
      icon: !err ? "check-circle" : "alert-circle",
      color: !err ? "success" : "danger",
      title: !err ? "Thành công!" : "Thất bại",
      text: !err ? "Xóa thành công!" : "Xóa thất bại!",
    };
    res.json({ result: !err, err });
  });
};
//#endregion

//#region shop info
module.exports.siUpdate = async (req, res) => {
  let sess = req.session.user;
  let updSI = {
    siName: req.body.siName,
    siAddress: req.body.siAddress,
    siHotline: req.body.siHotline,
    siFacebook: req.body.siFacebook,
    siZalo: req.body.siZalo,
    sId: sess.sId,
  };
  let siLogo = req.file?.filename || false;
  if (siLogo) {
    updSI.siLogo = siLogo;
  }
  if ((await ShopInfo.countDocuments()) > 0) {
    await ShopInfo.findOneAndUpdate({}, { $set: updSI }, (err) => {
      redirectFunc(
        !err,
        !err ? "Cập nhật thành công!" : "Cập nhật thất bại!",
        rootRoute,
        req,
        res
      );
    });
  } else {
    let newSI = new ShopInfo(updSI);
    try {
      await newSI.save();
      redirectFunc(true, "Thêm thành công!", rootRoute, req, res);
    } catch (error) {
      redirectFunc(false, "Thêm thất bại!", rootRoute, req, res);
    }
  }
};

//#endregion

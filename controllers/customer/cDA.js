const DA = require("../../models/mDeliveryAddress");
const Customer = require("../../models/mCustomer");
const Order = require("../../models/mOrder");

const pI = { title: "Thông tin giao hoàng", url: "personal" };
const rootRoute = `/${pI.url}`;

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
  res.redirect(`${pI.url}`);
};

module.exports.add = async (req, res) => {
  let prevUrl = req.headers.referer;
  let prevPage = `/${prevUrl.split("/").pop()}`;
  try {
    const sess = req.session?.user;
    let newDa = new DA({
      adReceiver: req.body.adReceiver.trim(),
      adNumber: req.body.adNumber.trim(),
      adProvince: req.body.adProvince.trim(),
      adDistrict: req.body.adDistrict.trim(),
      adWard: req.body.adWard.trim(),
      adDetail: req.body.adDetail.trim(),
      adIsDefault: req.body.adIsDefault === "",
      cId: sess.cId,
    });
    let cFound = Customer.findOne({ _id: sess.cId }).countDocuments();
    if (cFound == 0)
      redirectFunc(false, "Tài khoản không hợp lệ!", prevPage, req, res);
    else if (newDa.adReceiver.length == 0)
      redirectFunc(false, "Tên người nhận là bắt buộc!", prevPage, req, res);
    else if (newDa.adReceiver.length > 50)
      redirectFunc(
        false,
        "Tên người nhận tối đa 50 ký tự!",
        prevPage,
        req,
        res
      );
    else if (newDa.adNumber.length == 0)
      redirectFunc(false, "Số điện thoại là bắt buộc!", prevPage, req, res);
    else if (newDa.adNumber.length != 10)
      redirectFunc(false, "Số điện thoại gồm 10 số!", prevPage, req, res);
    else if (newDa.adProvince.length == 0)
      redirectFunc(false, "Tỉnh/TP là bắt buộc!", prevPage, req, res);
    else if (newDa.adDistrict.length == 0)
      redirectFunc(false, "Quận/Huyện là bắt buộc!", prevPage, req, res);
    else if (newDa.adWard.length == 0)
      redirectFunc(false, "Phường/Xã là bắt buộc!", prevPage, req, res);
    else if (newDa.adDetail.length == 0)
      redirectFunc(false, "Địa chỉ cụ thể là bắt buộc!", prevPage, req, res);
    else {
      if (newDa.adIsDefault) {
        await DA.findOne({ adIsDefault: true }, async (err, defaultA) => {
          if (defaultA) {
            defaultA.adIsDefault = false;
            defaultA.save();
          }
        });
      }
      await newDa.save();
      redirectFunc(true, "Thêm địa chỉ thành công!", prevPage, req, res);
    }
  } catch (error) {
    redirectFunc(true, "Thêm địa chỉ thất bại! " + error, prevPage, req, res);
  }
};

module.exports.update = async (req, res) => {
  await DA.findById(req.body.id, async (err, daFound) => {
    if (err) redirectFunc(false, err, rootRoute, req, res);
    else {
      try {
        daFound.adReceiver = req.body.adReceiver.trim();
        daFound.adNumber = req.body.adNumber.trim();
        daFound.adProvince = req.body.adProvince.trim();
        daFound.adDistrict = req.body.adDistrict.trim();
        daFound.adWard = req.body.adWard.trim();
        daFound.adDetail = req.body.adDetail.trim();
        daFound.adIsDefault = req.body.adIsDefault === "";
        if (daFound.adReceiver.length == 0)
          redirectFunc(
            false,
            "Tên người nhận là bắt buộc!",
            rootRoute,
            req,
            res
          );
        else if (daFound.adReceiver.length > 50)
          redirectFunc(
            false,
            "Tên người nhận tối đa 50 ký tự!",
            rootRoute,
            req,
            res
          );
        else if (daFound.adNumber.length == 0)
          redirectFunc(
            false,
            "Số điện thoại là bắt buộc!",
            rootRoute,
            req,
            res
          );
        else if (daFound.adNumber.length != 10)
          redirectFunc(false, "Số điện thoại gồm 10 số!", rootRoute, req, res);
        else if (daFound.adProvince.length == 0)
          redirectFunc(false, "Tỉnh/TP là bắt buộc!", rootRoute, req, res);
        else if (daFound.adDistrict.length == 0)
          redirectFunc(false, "Quận/Huyện là bắt buộc!", rootRoute, req, res);
        else if (daFound.adWard.length == 0)
          redirectFunc(false, "Phường/Xã là bắt buộc!", rootRoute, req, res);
        else if (daFound.adDetail.length == 0)
          redirectFunc(
            false,
            "Địa chỉ cụ thể là bắt buộc!",
            rootRoute,
            req,
            res
          );
        else if (daFound.adDetail.length > 255)
          redirectFunc(
            false,
            "Địa chỉ cụ thể tối đa 255 ký tự!",
            rootRoute,
            req,
            res
          );
        else {
          if (daFound.adIsDefault) {
            await DA.findOne({ adIsDefault: true }, async (err, defaultA) => {
              if (defaultA) {
                defaultA.adIsDefault = false;
                defaultA.save();
              }
            });
          }
          await daFound.save();
          redirectFunc(
            true,
            "Cập nhật địa chỉ thành công!",
            rootRoute,
            req,
            res
          );
        }
      } catch (error) {
        redirectFunc(
          true,
          "Cập nhật địa chỉ thất bại! " + error,
          rootRoute,
          req,
          res
        );
      }
    }
  });
};

module.exports.delete = async (req, res) => {
  let id = req.params.id;
  let orders_in_used = await Order.find({
    adId: id,
  }).countDocuments();
  if (mtr_in_used == 0) {
    await DA.findByIdAndDelete(
      id,
      (err) => err && res.json({ s: false, m: err })
    );
    req.session.messages = {
      icon: "check-circle",
      color: "success",
      title: "Thành công!",
      text: "Xóa thành công!",
    };
    res.json(true);
  } else {
    req.session.messages = {
      icon: "alert-circle",
      color: "danger",
      title: "Thất bại",
      text: "Không thể xóa Thông tin giao hàng đã có đơn đặt hàng sử dụng!",
    };
    res.json(false);
  }
};

const Mtrreq = require("../../models/mMtrreq");
const pI = { title: "Quản lý Nguyên vật liệu", url: "material" };
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
  res.redirect(rootRoute);
};

module.exports.add = async (req, res) => {
  const sess = req.session.user;
  try {
    let mrDetail = [];
    let mIds = req.body.mId;
    let mQuantitys = req.body.mQuantity;
    if (typeof mIds === "string") {
      mIds = [mIds];
      mQuantitys = [mQuantitys];
    }
    mIds.map((mId, index) => {
      if (mId.length == 0) {
        redirectFunc(
          false,
          "Tên nguyên vật liệu là băt buộc!",
          rootRoute,
          req,
          res
        );
        return;
      } else if (mQuantitys[index].length == 0) {
        redirectFunc(false, "Số lượng là băt buộc!", rootRoute, req, res);
        return;
      } else if (isNaN(mQuantitys[index])) {
        redirectFunc(false, "Số lượng không hợp lệ!", rootRoute, req, res);
        return;
      } else mrDetail.push({ mId, mQuantity: mQuantitys[index] });
    });
    let newMtrreq = new Mtrreq({
      mrReason: req.body.mrReason.trim(),
      mrDetail,
      scId: sess.sId,
      suId: sess.sId,
      mrState: 0,
    });
    if (newMtrreq.mrReason.length == 0) {
      redirectFunc(false, "Lý do là băt buộc!", rootRoute, req, res);
    } else if (newMtrreq.mrReason.length > 255) {
      redirectFunc(false, "Lý do tối đa 255 ký tự!", rootRoute, req, res);
    } else {
      await newMtrreq.save();
      redirectFunc(true, "Thêm yêu cầu thành công!", rootRoute, req, res);
    }
  } catch (error) {
    redirectFunc(false, "Thêm yêu cầu thất bại!", rootRoute, req, res);
  }
};

module.exports.update = async (req, res) => {
  const sess = req.session.user;
  let mrDetail = [];
  let mIds = req.body.mId;
  let mQuantitys = req.body.mQuantity;
  if (typeof mIds === "string") {
    mIds = [mIds];
    mQuantitys = [mQuantitys];
  }
  mIds.map((mId, index) => {
    if (mId.length == 0) {
      redirectFunc(
        false,
        "Tên nguyên vật liệu là băt buộc!",
        rootRoute,
        req,
        res
      );
      return;
    } else if (mQuantitys[index].length == 0) {
      redirectFunc(false, "Số lượng là băt buộc!", rootRoute, req, res);
      return;
    } else if (isNaN(mQuantitys[index])) {
      redirectFunc(false, "Số lượng không hợp lệ!", rootRoute, req, res);
      return;
    } else mrDetail.push({ mId, mQuantity: mQuantitys[index] });
  });
  let updMtrreq = {
    mrReason: req.body.mrReason.trim(),
    mrDetail,
    mrState: 0,
    suId: sess.sId,
  };
  if (updMtrreq.mrReason.length == 0) {
    redirectFunc(false, "Lý do là băt buộc!", rootRoute, req, res);
  } else if (updMtrreq.mrReason.length > 255) {
    redirectFunc(false, "Lý do tối đa 255 ký tự!", rootRoute, req, res);
  } else {
    try {
      await Mtrreq.findByIdAndUpdate(req.body.id, { $set: updMtrreq });
      redirectFunc(true, "Cập nhật thành công!", rootRoute, req, res);
    } catch (error) {
      redirectFunc(false, "Cập nhật thất bại!", rootRoute, req, res);
    }
  }
};

module.exports.patch = async (req, res) => {
  const sess = req.session.user;
  let updMtrreq = {
    mrState: req.body.mrState,
    suId: sess.sId,
  };
  await Mtrreq.findByIdAndUpdate(req.params.id, { $set: updMtrreq }, (err) => {
    req.session.messages = {
      icon: !err ? "check-circle" : "alert-circle",
      color: !err ? "success" : "danger",
      title: !err ? "Thành công!" : "Thất bại",
      text: !err ? "Cập nhật thành công!" : "Cập nhật thất bại!",
    };
    res.json(!err);
  });
};

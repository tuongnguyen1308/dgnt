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
  res.redirect("/material");
};

module.exports.add = async (req, res) => {
  const sess = req.session.user;
  try {
    let mrDetail = [];
    let mIds = req.body.mId;
    let mQuantitys = req.body.mQuantity;
    mIds.map((mId, index) => {
      mrDetail.push({ mId, mQuantity: mQuantitys[index] });
    });
    let newMtrreq = new Mtrreq({
      mrReason: req.body.mrReason,
      mrDetail,
      scId: sess.sId,
      suId: sess.sId,
      mrState: true,
    });
    await newMtrreq.save();
    redirectFunc(true, "Thêm yêu cầu thành công!", rootRoute, req, res);
  } catch (error) {
    redirectFunc(false, "Thêm yêu cầu thất bại!", rootRoute, req, res);
  }
};

module.exports.update = async (req, res) => {
  const sess = req.session.user;
  let mrDetail = [];
  let mIds = req.body.mId;
  let mQuantitys = req.body.mQuantity;
  mIds.map((mId, index) => {
    mrDetail.push({ mId, mQuantity: mQuantitys[index] });
  });
  let updMtrreq = {
    mrReason: req.body.mrReason,
    mrDetail,
    scId: sess.sId,
    suId: sess.sId,
  };
  try {
    await Mtrreq.findByIdAndUpdate(req.body.id, { $set: updMtrreq });
    redirectFunc(true, "Cập nhật thành công!", rootRoute, req, res);
  } catch (error) {
    redirectFunc(false, "Cập nhật thất bại!", rootRoute, req, res);
  }
  return;
};

module.exports.patch = async (req, res) => {
  const sess = req.session.user;
  let updMtrreq = {
    mrState: false,
    suId: sess.sId,
  };
  await Mtrreq.findByIdAndUpdate(req.params.id, { $set: updMtrreq }, (err) => {
    req.session.messages = {
      icon: !err ? "check-circle" : "alert-circle",
      color: !err ? "success" : "danger",
      title: !err ? "Thành công!" : "Thất bại",
      text: !err ? "Hủy yêu cầu thành công!" : "Hủy yêu cầu thất bại!",
    };
    res.json(!err);
  });
};

const Material = require("../../models/mMaterial");
const Mtrreq = require("../../models/mMtrreq");
const MtrBatch = require("../../models/mMtrbatch");
const pI = { title: "Quản lý Nguyên vật liệu", url: "material" };
const rootRoute = `/${pI.url}`;
const imgViewSize = 300;
const imgPreviewSize = 465;

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
  let materials = await Material.find({}).sort({ mName: "asc" }).populate({
    path: "sId",
    select: "sName",
  });
  let mtrreqs = await Mtrreq.find({})
    .sort({ createdAt: "desc" })
    .populate({
      path: "mrDetail.mId",
      select: "mName mUnit mImg",
    })
    .populate({
      path: "scId",
      select: "sName",
    })
    .populate({
      path: "suId",
      select: "sName",
    });
  let mtrbatchs = await MtrBatch.find({})
    .sort({ mbBatchAt: "desc" })
    .populate({ path: "mrId", select: "_id createdAt mrReason mrState" })
    .populate({
      path: "mbDetail.mId",
      select: "mName mUnit mImg",
    })
    .populate({
      path: "sId",
      select: "sName",
    });
  let mtrsCantBeDel = new Set();
  mtrreqs.map((mtrreq) => {
    mtrreq.mrDetail.map((mtr) => {
      mtrsCantBeDel.add(mtr.mId._id);
    });
  });
  mtrsCantBeDel = [...mtrsCantBeDel].join(" ");
  res.render(`./staff/${pI.url}`, {
    pI,
    messages,
    materials,
    mtrreqs,
    mtrbatchs,
    mtrsCantBeDel,
    imgViewSize,
    imgPreviewSize,
    sess,
  });
};

module.exports.add = (req, res) => {
  Material.find({ mName: req.body.mName }, async (err, mFound) => {
    if (mFound.length > 0) {
      redirectFunc(
        false,
        "Tên nguyên vật liệu đã tồn tại!",
        rootRoute,
        req,
        res
      );
    } else {
      const sess = req.session.user;
      try {
        let newMaterial = new Material({
          mName: req.body.mName,
          mDesc: req.body.mDesc,
          mUnit: req.body.mUnit,
          mStock: 0,
          mImg: req.file?.filename || "default.png",
          sId: sess.sId,
        });
        if (newMaterial.mName.length > 50) {
          redirectFunc(
            false,
            "Tên nguyên vật liệu tối đa 50 ký tự!",
            rootRoute,
            req,
            res
          );
        } else if (newMaterial.mDesc.length > 255) {
          redirectFunc(false, "Mô tả tối đa 255 ký tự!", rootRoute, req, res);
        } else if (!newMaterial.mImg.match(/\.(jpg|jpeg|png)$/i)) {
          redirectFunc(
            false,
            "Ảnh nguyên vật liệu không hợp lệ!",
            rootRoute,
            req,
            res
          );
        } else {
          await newMaterial.save();
          redirectFunc(
            true,
            "Thêm nguyên vật liệu thành công!",
            rootRoute,
            req,
            res
          );
        }
      } catch (error) {
        redirectFunc(
          false,
          "Thêm nguyên vật liệu thất bại!",
          rootRoute,
          req,
          res
        );
      }
    }
  });
  return;
};

module.exports.update = async (req, res) => {
  let updMaterial = {
    mName: req.body.mName,
    mDesc: req.body.mDesc,
    mUnit: req.body.mUnit,
  };
  let mImg = req.file?.filename || false;
  if (mImg) {
    updMaterial.mImg = mImg;
  }
  const mFound = await Material.find({
    mName: updMaterial.mName,
    _id: { $ne: req.body.id },
  });
  if (mFound.length > 0) {
    redirectFunc(false, "Tên nguyên vật liệu đã tồn tại!", rootRoute, req, res);
  } else
    try {
      await Material.findByIdAndUpdate(req.body.id, { $set: updMaterial });
      redirectFunc(true, "Cập nhật thành công!", rootRoute, req, res);
    } catch (error) {
      redirectFunc(false, "Cập nhật thất bại!", rootRoute, req, res);
    }
  return;
};

module.exports.delete = async (req, res) => {
  let already_req = await Mtrreq.find({
    "mrDetail.mId": req.params.id,
  }).countDocuments();
  if (already_req == 0) {
    await Material.findByIdAndDelete(req.params.id, function (err) {
      req.session.messages = {
        icon: !err ? "check-circle" : "alert-circle",
        color: !err ? "success" : "danger",
        title: !err ? "Thành công!" : "Thất bại",
        text: !err
          ? "Xóa nguyên vật liệu thành công!"
          : "Xóa nguyên vật liệu thất bại!",
      };
      res.json(!err);
    });
  } else {
    req.session.messages = {
      icon: "alert-circle",
      color: "danger",
      title: "Thất bại",
      text: "Không thể xóa NVL đã có yêu cầu nhập!",
    };
    res.json(false);
  }
};

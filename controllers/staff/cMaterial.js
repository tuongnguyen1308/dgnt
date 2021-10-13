const Material = require("../../models/mMaterial");
const Mtrreq = require("../../models/mMtrreq");
const MtrBatch = require("../../models/mMtrbatch");
const pI = { title: "Quản lý Nguyên vật liệu", url: "material" };
const rootRoute = `/${pI.url}`;
const imgViewSize = 300;
const imgPreviewSize = 465;
const PAGE_SIZE = 10;

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
  let pageNum = Math.max(req.query.pnum || 1, 1);
  // mtr
  let pageNumM = 1;
  let skipPageM = (pageNumM - 1) * PAGE_SIZE;
  let totalM = await Material.countDocuments();
  let totalMP = Math.ceil(totalM / PAGE_SIZE);
  // req
  let pageNumR = 1;
  let skipPageR = (pageNumR - 1) * PAGE_SIZE;
  let totalR = await Mtrreq.countDocuments();
  let totalRP = Math.ceil(totalR / PAGE_SIZE);
  // bat
  let pageNumB = 1;
  let skipPageB = (pageNumB - 1) * PAGE_SIZE;
  let totalB = await MtrBatch.countDocuments();
  let totalBP = Math.ceil(totalB / PAGE_SIZE);
  switch (req.query.pname) {
    case "mtr":
      pageNumM = pageNum;
      skipPageM = (pageNumM - 1) * PAGE_SIZE;
      break;
    case "req":
      pageNumR = pageNum;
      skipPageR = (pageNumR - 1) * PAGE_SIZE;
      break;
    case "bat":
      pageNumB = pageNum;
      skipPageB = (pageNumB - 1) * PAGE_SIZE;
      break;
  }
  //#endregion

  let materials = await Material.find({})
    .sort({ mName: "asc" })
    .skip(skipPageM)
    .limit(PAGE_SIZE)
    .populate({
      path: "sId",
      select: "sName",
    });
  let mtrreqs = await Mtrreq.find({})
    .sort({ createdAt: "desc" })
    .skip(skipPageR)
    .limit(PAGE_SIZE)
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
  let mtrreqs_ongoing = await Mtrreq.find({ mrState: 0 })
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
    .skip(skipPageB)
    .limit(PAGE_SIZE)
    .populate({ path: "mrId", select: "_id createdAt mrReason mrState" })
    .populate({
      path: "mbDetail.mId",
      select: "mName mUnit mImg",
    })
    .populate({
      path: "sId",
      select: "sName",
    });
  res.render(`./staff/${pI.url}`, {
    pI,
    messages,
    materials,
    mtrreqs,
    mtrreqs_ongoing,
    mtrbatchs,
    imgViewSize,
    imgPreviewSize,
    sess,
    pageNumM,
    pageNumR,
    pageNumB,
    totalM,
    totalR,
    totalB,
    totalMP,
    totalRP,
    totalBP,
    pageSize: PAGE_SIZE,
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
          mName: req.body.mName.trim(),
          mDesc: req.body.mDesc.trim(),
          mUnit: req.body.mUnit,
          mStock: 0,
          mImg: req.file?.filename || "default.png",
          sId: sess.sId,
        });
        if (newMaterial.mName.length == 0) {
          redirectFunc(
            false,
            "Tên nguyên vật liệu là bắt buộc!",
            rootRoute,
            req,
            res
          );
        } else if (newMaterial.mName.length > 50) {
          redirectFunc(
            false,
            "Tên nguyên vật liệu tối đa 50 ký tự!",
            rootRoute,
            req,
            res
          );
        }
        if (newMaterial.mUnit.length == 0) {
          redirectFunc(false, "Đơn vị tính là bắt buộc!", rootRoute, req, res);
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
    mName: req.body.mName.trim(),
    mDesc: req.body.mDesc.trim(),
    mUnit: req.body.mUnit,
  };
  let mImg = req.file?.filename || false;
  if (mImg) {
    updMaterial.mImg = mImg;
    if (!updMaterial.mImg.match(/\.(jpg|jpeg|png)$/i)) {
      redirectFunc(
        false,
        "Ảnh nguyên vật liệu không hợp lệ!",
        rootRoute,
        req,
        res
      );
    }
  }
  const mFound = await Material.find({
    mName: updMaterial.mName,
    _id: { $ne: req.body.id },
  });
  if (mFound.length > 0) {
    redirectFunc(false, "Tên nguyên vật liệu đã tồn tại!", rootRoute, req, res);
  } else if (updMaterial.mName.length == 0) {
    redirectFunc(
      false,
      "Tên nguyên vật liệu là bắt buộc!",
      rootRoute,
      req,
      res
    );
  } else if (updMaterial.mName.length > 50) {
    redirectFunc(
      false,
      "Tên nguyên vật liệu tối đa 50 ký tự!",
      rootRoute,
      req,
      res
    );
  }
  if (updMaterial.mUnit.length == 0) {
    redirectFunc(false, "Đơn vị tính là bắt buộc!", rootRoute, req, res);
  } else if (updMaterial.mDesc.length > 255) {
    redirectFunc(false, "Mô tả tối đa 255 ký tự!", rootRoute, req, res);
  }
  try {
    await Material.findByIdAndUpdate(req.body.id, { $set: updMaterial });
    redirectFunc(true, "Cập nhật thành công!", rootRoute, req, res);
  } catch (error) {
    redirectFunc(false, "Cập nhật thất bại!", rootRoute, req, res);
  }
  return;
};

module.exports.delete = async (req, res) => {
  let mtr_in_used = await Mtrreq.find({
    "mrDetail.mId": req.params.id,
  }).countDocuments();
  if (mtr_in_used == 0) {
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

module.exports.find = async (req, res) => {
  let keyword = req.body.keyword;
  Material.find({ mName: new RegExp(keyword, "i") }, async (err, materials) => {
    res.json(materials);
  });
};

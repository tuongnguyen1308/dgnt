const Account = require("../../models/mAccount");
const Material = require("../../models/mMaterial");
const Role = require("../../models/mRole");
const bcrypt = require("bcrypt");
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
  let materials = await Material.find({}).populate({
    path: "sId",
    select: "sName",
  });
  res.render(`./staff/${pI.url}`, {
    pI,
    messages,
    materials,
    imgViewSize,
    imgPreviewSize,
    sess,
  });
};

module.exports.add = (req, res) => {
  Material.find({ username: req.body.aUsername }, async (err, users_found) => {
    if (err) {
      redirectFunc(false, "Thêm tài khoản thất bại!", rootRoute, req, res);
    } else if (users_found.length) {
      redirectFunc(false, "Tên đăng nhập này đã tồn tại!", rootRoute, req, res);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(req.body.aPassword, salt);
      let newAcc = new Account({
        aUsername: req.body.aUsername,
        aPassword: hashPassword,
        rId: req.body.rId,
      });
      try {
        let accSaved = await newAcc.save();
        let newStaff = new Material({
          sName: req.body.sName,
          sDofB: req.body.sDofB,
          sNumber: req.body.sNumber,
          sEmail: req.body.sEmail,
          sImg: req.file?.filename,
          sState: req.body.sState == "on",
          sJoinAt: new Date(),
          aId: accSaved._id,
        });
        await newStaff.save();
        redirectFunc(true, "Đã thêm thành viên", rootRoute, req, res);
      } catch (error) {
        redirectFunc(false, "Cấp tài khoản thất bại!", rootRoute, req, res);
      }
    }
  });
  return;
};

module.exports.update = async (req, res) => {
  let updStaff = {
    sName: req.body.sName,
    sDofB: req.body.sDofB,
    sNumber: req.body.sNumber,
    sEmail: req.body.sEmail,
    sState: req.body.sState == "on",
  };
  let sImg = req.file?.filename || false;
  if (sImg) {
    updStaff.sImg = sImg;
  }
  let updAcc = {
    rId: req.body.rId,
  };
  let aPassword = req.body.aPassword;
  if (aPassword) {
    const salt = await bcrypt.genSalt(10);
    const aPassword = await bcrypt.hash(req.body.aPassword, salt);
    updAcc.aPassword = aPassword;
  }
  try {
    await Account.findByIdAndUpdate(req.body.aid, {
      $set: updAcc,
    });
  } catch (error) {
    redirectFunc(false, "Đổi mật khẩu thất bại!", rootRoute, req, res);
  }
  try {
    await Material.findByIdAndUpdate(req.body.id, { $set: updStaff });
    redirectFunc(true, "Cập nhật thành công!", rootRoute, req, res);
  } catch (error) {
    redirectFunc(false, "Cập nhật thất bại!", rootRoute, req, res);
  }
  return;
};

module.exports.delete = async (req, res) => {
  try {
    await Material.deleteOne({ aId: req.params.id }, function (err) {
      err && res.json(err);
    });
    let result = await Account.deleteOne(
      { _id: req.params.id },
      (err) => err && res.json(err)
    );
    req.session.messages = {
      icon: result ? "check-circle" : "alert-circle",
      color: result ? "success" : "danger",
      title: result ? "Thành công!" : "Thất bại",
      text: result ? "Xóa thành viên thành công!" : "Xóa thành viên thất bại!",
    };
    res.json(result);
  } catch (error) {
    req.session.messages = {
      icon: "alert-circle",
      color: "danger",
      title: "Thất bại",
      text: "Xóa thành viên thất bại!",
    };
  }
};

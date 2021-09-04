const Account = require("../../models/mAccount");
const Staff = require("../../models/mStaff");
const Role = require("../../models/mRole");
const bcrypt = require("bcrypt");
const curPage = "staff";
const rootRoute = `/${curPage}`;

module.exports.index = async (req, res) => {
  const title = "Quản lý Thành viên";
  const messages = req.session?.messages || null;
  const roles = await Role.find({ rName: { $ne: "Khách hàng" } });
  const sess = req.session.user;
  req.session.messages = null;
  let staff = await Staff.find({}).populate("aId");
  res.render(`./staff/${curPage}`, {
    title,
    curPage,
    messages,
    staff,
    roles,
    sess,
  });
};

module.exports.add = (req, res) => {
  Staff.find({ username: req.body.aUsername }, async (err, users_found) => {
    let redirectFunc = (icon, color, title, text, dir) => {
      req.session.messages = {
        icon,
        color,
        title,
        text,
      };
      res.redirect(dir);
      return;
    };
    if (err) {
      redirectFunc(
        "alert-circle",
        "danger",
        "Thất bại!",
        "Có lỗi xảy ra trong quá trình thêm!",
        rootRoute
      );
    } else if (users_found.length) {
      redirectFunc(
        "alert-circle",
        "danger",
        "Thất bại!",
        "Tên đăng nhập này đã tồn tại!",
        rootRoute
      );
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
        let newStaff = new Staff({
          sName: req.body.sName,
          sDofB: req.body.sDofB,
          sNumber: req.body.sNumber,
          sEmail: req.body.sEmail,
          sImg: req.file?.filename,
          sState: req.body.sState == "on",
          aId: accSaved._id,
        });
        let staffSaved = await newStaff.save();
        redirectFunc(
          "check-circle",
          "success",
          "Thành công",
          "Đã thêm thành viên",
          rootRoute
        );
      } catch (error) {
        redirectFunc(
          "alert-circle",
          "danger",
          "Thất bại!",
          "Có lỗi xảy ra khi cấp tài khoản!",
          rootRoute
        );
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
    let accSave = await Account.findByIdAndUpdate(req.body.aid, {
      $set: updAcc,
    });
  } catch (error) {
    redirectFunc(
      "alert-circle",
      "danger",
      "Thất bại!",
      "Có lỗi xảy ra khi đổi mật khẩu cho tài khoản!",
      rootRoute
    );
  }
  try {
    let result = await Staff.findByIdAndUpdate(req.body.id, { $set: updStaff });
    req.session.messages = {
      icon: "check-circle",
      color: "success",
      title: "Thành công!",
      text: "Đã cập nhât thành viên",
    };
    res.redirect(rootRoute);
    return;
  } catch (error) {
    redirectFunc(
      "alert-circle",
      "danger",
      "Thất bại!",
      "Có lỗi xảy ra khi cập nhật tài khoản!",
      rootRoute
    );
  }
};

module.exports.delete = async (req, res) => {
  let result = await Staff.deleteOne({ _id: req.params.id }, function (err) {
    err && res.json(err);
  });
  req.session.messages = {
    icon: result ? "check-circle" : "alert-circle",
    color: result ? "success" : "danger",
    title: result ? "Thành công!" : "Thất bại",
    text: result ? "Đã xoá thành viên" : "Đã có lỗi xảy ra",
  };
  res.json(result);
};

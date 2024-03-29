const Account = require("../../models/mAccount");
const Staff = require("../../models/mStaff");
const Role = require("../../models/mRole");
const bcrypt = require("bcrypt");
const pI = { title: "Quản lý Thành viên", url: "staff" };
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
  const roles = await Role.find({ rName: { $ne: "Khách hàng" } });
  const sess = req.session.user;
  req.session.messages = null;
  let staff = await Staff.find({})
    .sort({ sName: "asc" })
    .populate({
      path: "aId",
      select: "aUsername rId",
      populate: { path: "rId" },
    });
  let grpByRole = staff.reduce((grpByRole, s) => {
    (grpByRole[!s.sState ? "Đã nghỉ làm" : s.aId.rId.rName] =
      grpByRole[!s.sState ? "Đã nghỉ làm" : s.aId.rId.rName] || []).push(s);
    return grpByRole;
  }, {});
  res.render(`./staff/${pI.url}`, {
    pI,
    messages,
    grpByRole,
    imgViewSize,
    imgPreviewSize,
    roles,
    sess,
  });
};

module.exports.add = (req, res) => {
  Account.find(
    { aUsername: req.body.aUsername.trim().toLowerCase() },
    async (err, users_found) => {
      if (err) {
        redirectFunc(false, "Tên tài khoản đã tồn tại!", rootRoute, req, res);
      } else if (users_found.length > 0) {
        redirectFunc(false, "Tên tài khoản đã tồn tại!", rootRoute, req, res);
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.aPassword, salt);
        let newAcc = new Account({
          aUsername: req.body.aUsername.trim().toLowerCase(),
          aPassword: hashPassword,
          rId: req.body.rId,
        });
        try {
          let newStaff = new Staff({
            sName: req.body.sName.trim(),
            sDofB: req.body.sDofB,
            sNumber: req.body.sNumber,
            sEmail: req.body.sEmail,
            sImg: req.file?.filename,
            sState: req.body.sState == "on",
            sJoinAt: new Date(),
          });

          if (req.body.sDofB != "") {
            let ns = new Date(req.body.sDofB);
            if (ns == "Invalid Date") {
              redirectFunc(
                false,
                "Ngày sinh không hợp lệ!",
                rootRoute,
                req,
                res
              );
              return;
            } else if (
              new Date().getFullYear() - req.body.sDofB.slice(0, 4) <
              18
            ) {
              redirectFunc(
                false,
                "Nhân viên phải đủ 18 tuổi!",
                rootRoute,
                req,
                res
              );
              return;
            }
          }
          let accSaved = await newAcc.save();
          newStaff.aId = accSaved._id;
          await newStaff.save();
          redirectFunc(true, "Đã thêm thành viên", rootRoute, req, res);
        } catch (error) {
          console.error(error);
          redirectFunc(false, "Cấp tài khoản thất bại!", rootRoute, req, res);
        }
      }
    }
  );
  return;
};

module.exports.update = async (req, res) => {
  let updStaff = {
    sName: req.body.sName.trim(),
    sDofB: req.body.sDofB,
    sNumber: req.body.sNumber,
    sEmail: req.body.sEmail,
    sState: req.body.sState == "on",
  };

  if (updStaff.sDofB != "") {
    let ns = new Date(updStaff.sDofB);
    if (ns == "Invalid Date") {
      redirectFunc(false, "Ngày sinh không hợp lệ!", rootRoute, req, res);
      return;
    } else if (new Date().getFullYear() - updStaff.sDofB.slice(0, 4) < 18) {
      redirectFunc(false, "Nhân viên phải đủ 18 tuổi!", rootRoute, req, res);
      return;
    }
  }
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
    await Staff.findByIdAndUpdate(req.body.id, { $set: updStaff });
    redirectFunc(true, "Cập nhật thành công!", rootRoute, req, res);
  } catch (error) {
    redirectFunc(false, "Cập nhật thất bại!", rootRoute, req, res);
  }
  return;
};

module.exports.delete = async (req, res) => {
  try {
    await Staff.deleteOne({ aId: req.params.id }, function (err) {
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

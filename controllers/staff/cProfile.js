const Account = require("../../models/mAccount");
const Staff = require("../../models/mStaff");
const bcrypt = require("bcrypt");
const curPage = "profile";
const rootRoute = `/${curPage}`;
const imgViewSize = 300;
const imgPreviewSize = 350;

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
  const title = "Cá nhân";
  const messages = req.session?.messages || null;
  const sess = req.session.user;
  req.session.messages = null;
  let staff = await Staff.findOne({ aId: sess._id }).populate({
    path: "aId",
    select: "aUsername rId",
    populate: { path: "rId" },
  });
  let dofb = JSON.stringify(staff.sDofB);
  let joinat = JSON.stringify(staff.sJoinAt);
  let profile = {
    sImg: staff.sImg,
    sState: staff.sState,
    _id: staff._id,
    sName: staff.sName,
    sDofB: dofb?.slice(1, 11) || "",
    sNumber: staff.sNumber,
    sEmail: staff.sEmail,
    aId: staff.aId,
    sJoinAt: joinat?.slice(1, 11).split("-").reverse().join("/") || "",
  };
  res.render(`./staff/${curPage}`, {
    title,
    curPage,
    messages,
    profile,
    imgViewSize,
    imgPreviewSize,
    sess,
  });
};
module.exports.update = async (req, res) => {
  const sess = req.session.user;
  let updStaff = {
    sName: req.body.sName,
    sDofB: req.body.sDofB,
    sNumber: req.body.sNumber,
    sEmail: req.body.sEmail,
  };
  let sImg = req.file?.filename || false;
  if (sImg) {
    updStaff.sImg = sImg;
  }
  try {
    let staffSaved = await Staff.findOneAndUpdate(
      { aId: sess._id },
      { $set: updStaff }
    );
    redirectFunc(true, "Cập nhật thành công!", rootRoute, req, res);
  } catch (error) {
    redirectFunc(false, "Cập nhật thất bại!", rootRoute, req, res);
  }
};
module.exports.changePassword = async (req, res) => {
  const sess = req.session.user;
  Account.findById(sess._id, async (err, accFound) => {
    if (err) {
      redirectFunc(false, "Không tìm thấy tài khoản!", rootRoute, req, res);
    } else {
      const isCorrectPassword = await bcrypt.compare(
        req.body.oldPassword,
        accFound.aPassword
      );
      if (!isCorrectPassword) {
        redirectFunc(false, "Mật khẩu cũ không đúng!", rootRoute, req, res);
        return;
      } else {
        const salt = await bcrypt.genSalt(10);
        const aPassword = await bcrypt.hash(req.body.newPassword, salt);
        let updAcc = { aPassword };
        try {
          let accSave = await Account.findByIdAndUpdate(sess._id, {
            $set: updAcc,
          });
          redirectFunc(true, "Đổi mật khẩu thành công!", rootRoute, req, res);
        } catch (error) {
          redirectFunc(false, "Đổi mật khẩu thất bại!", rootRoute, req, res);
        }
      }
    }
  });
  return;
};

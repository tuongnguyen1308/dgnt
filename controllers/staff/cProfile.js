const Account = require("../../models/mAccount");
const Staff = require("../../models/mStaff");
const bcrypt = require("bcrypt");
const curPage = "profile";
const rootRoute = `/${curPage}`;
const imgViewSize = 300;
const imgPreviewSize = 350;

let redirectFunc = (icon, color, title, text, dir, req, res) => {
  req.session.messages = {
    icon,
    color,
    title,
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
  console.log(sess);
  let updStaff = {
    sName: req.body.sName,
    sDofB: req.body.sDofB,
    sNumber: req.body.sNumber,
    sEmail: req.body.sEmail,
  };
  console.log(updStaff);
  let sImg = req.file?.filename || false;
  if (sImg) {
    updStaff.sImg = sImg;
  }
  try {
    let staffSaved = await Staff.findOneAndUpdate(
      { aId: sess._id },
      { $set: updStaff }
    );
    redirectFunc(
      "check-circle",
      "success",
      "Thành công",
      "Cập nhật thành công!",
      rootRoute,
      req,
      res
    );
  } catch (error) {
    redirectFunc(
      "alert-circle",
      "danger",
      "Thất bại!",
      "Cập nhật thất bại!",
      rootRoute,
      req,
      res
    );
  }
};

module.exports.changePassword = async (req, res) => {
  const sess = req.session.user;
  const salt = await bcrypt.genSalt(10);
  const aPassword = await bcrypt.hash(req.body.newPassword, salt);
  let updAcc = {
    aPassword,
  };
  try {
    let accSave = await Account.findByIdAndUpdate(sess._id, {
      $set: updAcc,
    });
    redirectFunc(
      "check-circle",
      "success",
      "Thành công",
      "Đổi mật khẩu thành công!",
      rootRoute,
      req,
      res
    );
  } catch (error) {
    redirectFunc(
      "alert-circle",
      "danger",
      "Thất bại!",
      "Đổi mật khẩu thất bại!",
      rootRoute,
      req,
      res
    );
  }
};

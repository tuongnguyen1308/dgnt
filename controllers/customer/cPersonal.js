const Account = require("../../models/mAccount");
const Customer = require("../../models/mCustomer");
const bcrypt = require("bcrypt");
const pI = { title: "Thông tin cá nhân", url: "personal" };
const rootRoute = `/${pI.url}`;
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
  const messages = req.session?.messages || null;
  const sess = req.session.user;
  req.session.messages = null;
  let customer = await Customer.findOne({ aId: sess._id }).populate({
    path: "aId",
    select: "aUsername rId",
  });
  let dofb = customer.cDofB ? JSON.stringify(customer.cDofB) : "";
  let personal = {
    cImg: customer.cImg,
    _id: customer._id,
    cName: customer.cName,
    cDofB: dofb?.slice(1, 11) || "",
    cNumber: customer.cNumber,
    cEmail: customer.cEmail,
    aId: customer.aId,
  };
  res.render(`./customer/${pI.url}`, {
    pI,
    messages,
    sess,
    imgPreviewSize,
    personal,
  });
};
module.exports.update = async (req, res) => {
  const sess = req.session.user;
  let updCustomer = {
    cName: req.body.cName,
    cDofB: req.body.cDofB,
    cNumber: req.body.cNumber,
    cEmail: req.body.cEmail,
  };
  let cImg = req.file?.filename || false;
  if (cImg) {
    updCustomer.cImg = cImg;
  }
  try {
    let cusSaved = await Customer.findOneAndUpdate(
      { aId: sess._id },
      { $set: updCustomer }
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

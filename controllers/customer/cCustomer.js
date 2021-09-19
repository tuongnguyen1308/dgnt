const Account = require("../../models/mAccount");
const Customer = require("../../models/mCustomer");
const Role = require("../../models/mRole");
const bcrypt = require("bcrypt");
module.exports.index = async (req, res) => {
  const pI = { title: "Trang chủ", url: "home" };
  const messages = req.session?.messages || null;
  const sess = req.session.user;
  req.session.messages = null;
  res.render(`./customer/${pI.url}`, {
    pI,
    messages,
    sess,
  });
};

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

module.exports.auth = async (req, res, next) => {
  let prevUrl = req.headers.referer;
  let prevPage = `/${prevUrl.split("/").pop()}`;
  try {
    const accFound = await Account.findOne({
      aUsername: req.body.si_username,
    }).populate("rId");
    if (!accFound) {
      redirectFunc(false, "Tên tài khoản không đúng!", prevPage, req, res);
      return;
    }
    const isCorrectPassword = await bcrypt.compare(
      req.body.si_password,
      accFound.aPassword
    );
    if (!isCorrectPassword) {
      redirectFunc(false, "Mật khẩu không đúng!", prevPage, req, res);
      return;
    }
    // đúng user
    let user = {
      _id: accFound._id,
      aUsername: accFound.aUsername,
      aPassword: accFound.aPassword,
      rId: accFound.rId,
      sId: null,
      sState: null,
    };
    req.session.user = user;
    redirectFunc(true, "Đăng nhập thành công!", prevPage, req, res);
    return;
  } catch (err) {
    next(err);
  }
};

module.exports.signup = async (req, res, next) => {
  let prevUrl = req.headers.referer;
  let prevPage = `/${prevUrl.split("/").pop()}`;
  let customerRole = await Role.findOne({ rName: "Khách hàng" });
  let newAccount = {
    aUsername: req.body.su_username,
    aPassword: req.body.su_password,
    rId: customerRole._id,
  };
  if (newAccount.aUsername.length == 0) {
    redirectFunc(false, "Tên tài khoản là bắt buộc!", prevPage, req, res);
    return;
  }
  try {
    const accFound = await Account.findOne({
      aUsername: newAccount.aUsername,
    });
    if (accFound) {
      redirectFunc(false, "Tên tài khoản đã tồn tại!", prevPage, req, res);
      return;
    }

    if (newAccount.aPassword.length == 0) {
      redirectFunc(false, "Mật khẩu là bắt buộc!", prevPage, req, res);
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newAccount.aPassword, salt);
    newAccount.aPassword = hashPassword;
    let newCustomer = {
      cName: req.body.cName,
      cDofB: req.body.cDofB,
      cEmail: req.body.cEmail,
      cNumber: req.body.cNumber,
      cImg: req.file?.filename,
    };

    if (newCustomer.cName.length == 0) {
      redirectFunc(false, "Tên khách hàng là bắt buộc!", prevPage, req, res);
      return;
    }
    if (newCustomer.cNumber.length == 0) {
      redirectFunc(false, "Số điện thoại là bắt buộc!", prevPage, req, res);
      return;
    } else {
      const cFound = await Customer.findOne({
        cNumber: newCustomer.cNumber,
      });
      if (cFound) {
        redirectFunc(false, "Số điện thoại đã bị trùng!", prevPage, req, res);
        return;
      }
    }
    if (newCustomer.cEmail.length != 0) {
      const cFound = await Customer.findOne({
        cEmail: newCustomer.cEmail,
      });
      if (cFound) {
        redirectFunc(false, "Email đã bị trùng!", prevPage, req, res);
        return;
      }
    }
    let newAcc = new Account(newAccount);
    let newCus = new Customer(newCustomer);
    let accSaved = await newAcc.save();
    newCus.aId = accSaved._id;
    let newSess = await newCus.save();
    // đúng user
    let user = {
      _id: newSess.aId,
      aUsername: newSess.aUsername,
      aPassword: newSess.aPassword,
      rId: customerRole,
      sId: null,
      sState: null,
    };
    req.session.user = user;
    redirectFunc(true, "Đăng ký thành công!", prevPage, req, res);
    return;
  } catch (err) {
    next(err);
  }
};

module.exports.logout = async (req, res) => {
  req.session.user = null;
  redirectFunc(true, "Đã đăng xuất!", "/", req, res);
  return;
};

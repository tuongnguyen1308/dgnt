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
  let username = req.body.si_username.trim().toLowerCase();
  if (username.length == 0) {
    redirectFunc(false, "Tên tài khoản là bắt buộc!", prevPage, req, res);
    return;
  }
  let password = req.body.si_password;
  if (password.length == 0) {
    redirectFunc(false, "Mật khẩu là bắt buộc!", prevPage, req, res);
    return;
  }
  try {
    const accFound = await Account.findOne({
      aUsername: username,
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
    let cFound = await Customer.findOne({ aId: accFound._id });
    if (!cFound) {
      redirectFunc(
        false,
        "Vui lòng đăng nhập bằng tài khoản khách hàng!",
        prevPage,
        req,
        res
      );
      return;
    }
    let user = {
      _id: accFound._id,
      aUsername: accFound.aUsername.toLowerCase(),
      rId: accFound.rId,
      sId: null,
      sState: null,
      cId: cFound._id,
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
  let su_repassword = req.body.su_repassword;
  let newAccount = {
    aUsername: req.body.su_username.trim().toLowerCase(),
    aPassword: req.body.su_password,
    rId: customerRole._id,
  };
  if (newAccount.aUsername.length == 0) {
    redirectFunc(false, "Tên tài khoản là bắt buộc!", prevPage, req, res);
    return;
  }
  if (newAccount.aUsername.length >= 50) {
    redirectFunc(false, "Tên tài khoản tối đa 50 ký tự!", prevPage, req, res);
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

    if (newAccount.aPassword.length < 6) {
      redirectFunc(false, "Mật khẩu tối thiểu 6 ký tự!", prevPage, req, res);
      return;
    }
    if (newAccount.aPassword.length > 50) {
      redirectFunc(false, "Mật khẩu tối đa 50 ký tự!", prevPage, req, res);
      return;
    }
    if (su_repassword.length == 0) {
      redirectFunc(false, "Nhập lại mật khẩu là bắt buộc!", prevPage, req, res);
      return;
    }
    if (newAccount.aPassword != su_repassword) {
      redirectFunc(
        false,
        "Mật khẩu và xác nhận mật khẩu không đúng!",
        prevPage,
        req,
        res
      );
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
      redirectFunc(false, "Họ tên là bắt buộc!", prevPage, req, res);
      return;
    }
    if (newCustomer.cName.length > 50) {
      redirectFunc(false, "Họ tên tối đa 50 ký tự!", prevPage, req, res);
      return;
    }
    if (newCustomer.cNumber.length == 0) {
      redirectFunc(false, "Số điện thoại là bắt buộc!", prevPage, req, res);
      return;
    } else {
      if (newCustomer.cNumber.length != 10) {
        redirectFunc(false, "Số điện thoại gồm 10 ký tự!", prevPage, req, res);
        return;
      }
      const cFound = await Customer.findOne({
        cNumber: newCustomer.cNumber,
      });
      if (cFound) {
        redirectFunc(false, "Số điện thoại đã tồn tại!", prevPage, req, res);
        return;
      }
    }

    if (req.body.cDofB != "") {
      let ns = new Date(req.body.cDofB);
      if (ns == "Invalid Date") {
        redirectFunc(false, "Ngày sinh không hợp lệ!", prevPage, req, res);
        return;
      } else if (new Date().getFullYear() - req.body.cDofB.slice(0, 4) < 18) {
        redirectFunc(false, "Khách hàng phải đủ 18 tuổi!", prevPage, req, res);
        return;
      }
    }

    if (newCustomer.cEmail.length != 0) {
      const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!re.test(String(newCustomer.cEmail).toLowerCase())) {
        redirectFunc(false, "Email không hợp lệ!", prevPage, req, res);
        return;
      }

      const cFound = await Customer.findOne({
        cEmail: newCustomer.cEmail,
      });
      if (cFound) {
        redirectFunc(false, "Email đã tồn tại!", prevPage, req, res);
        return;
      }
    }
    if (newCustomer.cImg) {
      if (!newCustomer.cImg.match(/\.(jpg|jpeg|png)$/i)) {
        redirectFunc(false, "Ảnh không hợp lệ!", prevPage, req, res);
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
      cId: newSess._id,
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

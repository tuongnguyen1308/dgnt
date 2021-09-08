const Account = require("../models/mAccount");
const Staff = require("../models/mStaff");
const rootRoute = "/login-staff";
module.exports.Auth = async (req, res, next) => {
  let redirectFunc = (state, text, dir) => {
    req.session.messages = {
      icon: state ? "check-circle" : "alert-circle",
      color: state ? "success" : "warning",
      title: state ? "Thành công" : "Thông báo",
      text,
      text,
    };
    res.redirect(dir);
  };

  let sess = req.session.user;

  if (!sess) {
    redirectFunc(false, "Vui lòng đăng nhập!", rootRoute);
    return;
  }
  if (!sess || sess.rId.rName == "Khách hàng") {
    redirectFunc(false, "Tài khoản không tồn tại trong hệ thống!", rootRoute);
    return;
  } else if (!sess.sState) {
    redirectFunc(false, "Bạn đã nghỉ việc!", rootRoute);
    return;
  }
  next();
};

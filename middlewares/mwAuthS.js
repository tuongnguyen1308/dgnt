const Account = require("../models/mAccount");
const Staff = require("../models/mStaff");
const rootRoute = "/login-staff";
module.exports.Auth = async (req, res, next) => {
  let redirectFunc = (icon, color, title, text, dir) => {
    req.session.messages = {
      icon,
      color,
      title,
      text,
    };
    res.redirect(dir);
  };
  if (!req.session.user) {
    redirectFunc(
      "alert-circle",
      "warning",
      "Thông báo!",
      "Vui lòng đăng nhập!",
      rootRoute
    );
    return;
  }
  const accFound = await Account.findOne({
    aUsername: req.session.user.aUsername,
  }).populate("rId");
  if (!accFound) {
    redirectFunc(
      "alert-circle",
      "warning",
      "Thông báo!",
      "Tài khoản không tồn tại trong hệ thống!",
      rootRoute
    );
    return;
  }
  if (accFound.rId.rName != "Quản lý") {
    if (accFound.rId.rName != "Khách hàng") {
      const staffInfo = await Staff.findOne({ aId: accFound._id });
      if (!staffInfo.sState) {
        redirectFunc(
          "alert-circle",
          "warning",
          "Thông báo!",
          "Bạn đã nghỉ việc!",
          rootRoute
        );
        return;
      }
    }
  }
  next();
};

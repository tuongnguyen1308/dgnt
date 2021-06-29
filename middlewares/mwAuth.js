const User = require("../models/mUser");
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
    return;
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
  const user = await User.findOne({ username: req.session.user.username });
  if (!user) {
    redirectFunc(
      "alert-circle",
      "warning",
      "Thông báo!",
      "Tài khoản không tồn tại trong hệ thống!",
      rootRoute
    );
    return;
  }
  next();
};

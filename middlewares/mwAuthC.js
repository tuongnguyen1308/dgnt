const rootRoute = "/";
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
  if (!sess || sess.rId.rName != "Khách hàng") {
    redirectFunc(false, "Bạn cần đăng nhập với quyền khách hàng!", rootRoute);
    return;
  }
  next();
};

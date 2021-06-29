const User = require("../../models/mUser");
const bcrypt = require("bcrypt");
module.exports.index = async (req, res) => {
  const title = "Đăng nhập";
  const username = req.session?.username || null;
  const errMessage = req.session?.errMessage || null;
  const messages = req.session?.messages || null;
  req.session.username = null;
  req.session.errMessage = null;
  req.session.messages = null;
  res.render("./staff/login", {
    title,
    username,
    errMessage,
    messages,
  });
};

module.exports.auth = async (req, res, next) => {
  let redirectFunc = (mess, dir) => {
    req.session.username = req.body.username;
    req.session.errMessage = mess;
    res.redirect(dir);
    return;
  };

  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      redirectFunc("Tài khoản không tồn tại!", "/login-staff");
      return;
    }
    const isCorrectPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isCorrectPassword) {
      redirectFunc("Mật khẩu không đúng!", "/login-staff");
      return;
    }
    // đúng user
    req.session.user = user;
    req.session.messages = {
      icon: "check-circle",
      color: "success",
      title: "Thành công!",
      text: "Đăng nhập thành công!",
    };
    res.status(200).redirect("/dashboard");
    return;
  } catch (err) {
    next(err);
  }
};

module.exports.logout = async (req, res) => {
  req.session.user = null;
  req.session.message = "Đã đăng xuất!";
  res.redirect("/login-staff");
  return;
};

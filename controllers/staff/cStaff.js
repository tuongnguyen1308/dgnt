const User = require("../../models/mUser");
const bcrypt = require("bcrypt");
const roles = [
  { rNumber: 1, rTitle: "Admin" },
  { rNumber: 2, rTitle: "Nhân viên" },
];
const rootRoute = "/staff";
module.exports.index = async (req, res) => {
  const title = "Quản lý nhân viên";
  const curPage = "staff";
  const messages = req.session?.messages || null;
  req.session.messages = null;
  let users = await User.find({});
  res.render("./staff/staff", {
    title: "Quản lý nhân viên",
    title,
    curPage,
    messages,
    users,
    roles,
  });
};

module.exports.add = (req, res) => {
  User.find({ username: req.body.username }, async (err, users_found) => {
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
    if (err) {
      redirectFunc(
        "alert-circle",
        "danger",
        "Thất bại!",
        "Có lỗi xảy ra trong quá trình thêm!",
        rootRoute
      );
    } else if (users_found.length) {
      redirectFunc(
        "alert-circle",
        "danger",
        "Thất bại!",
        "Tên đăng nhập này đã tồn tại!",
        rootRoute
      );
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(req.body.password, salt);
      let newUser = new User({
        username: req.body.username,
        password: hashPassword,
        fullname: req.body.fullname,
        phone: req.body.phone,
        email: req.body.email,
        role: {
          rNumber: req.body.rNumber,
          rTitle: roles.find((role) => role.rNumber == req.body.rNumber).rTitle,
        },
      });
      console.log(newUser);
      let result = await newUser.save();
      redirectFunc(
        "check-circle",
        "success",
        "Thành công",
        "Đã thêm nhân viên",
        rootRoute
      );
    }
  });
  return;
};

const User = require("../../models/mUser");
const bcrypt = require("bcrypt");
const roles = [
  { rNumber: 1, rTitle: "Admin" },
  { rNumber: 2, rTitle: "Nhân viên" },
];
const rootRoute = "/staff";

module.exports.index = async (req, res) => {
  const title = "Quản lý Thành viên";
  const curPage = "staff";
  const messages = req.session?.messages || null;
  const sess = req.session.user;
  req.session.messages = null;
  let users = await User.find({});
  res.render("./staff/staff", {
    title,
    curPage,
    messages,
    users,
    roles,
    sess,
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

module.exports.update = async (req, res) => {
  let updUser = {
    fullname: req.body.fullname,
    phone: req.body.phone,
    email: req.body.email,
    role: {
      rNumber: req.body.rNumber,
      rTitle: roles.find((role) => role.rNumber == req.body.rNumber).rTitle,
    },
  };
  let password = req.body.password;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    updUser.password = await bcrypt.hash(req.body.password, salt);
  }
  let result = await User.findByIdAndUpdate(req.body.id, { $set: updUser });
  req.session.messages = {
    icon: "check-circle",
    color: "success",
    title: "Thành công!",
    text: "Đã cập nhât thông tin",
  };
  console.log(result);
  res.redirect(rootRoute);
  return;
};

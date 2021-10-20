const Account = require("../../models/mAccount");
const Staff = require("../../models/mStaff");
const Role = require("../../models/mRole");
const col_roles = require("../../data/col_roles.json");
const bcrypt = require("bcrypt");

const checkDB = async () => {
  await Role.find({}, (err, roles) => {
    if (roles.length == 0) {
      col_roles.map(async (r) => {
        let newRole = new Role({
          rName: r.rName,
        });
        console.log(newRole);
        await newRole.save();
      });
    }
  });
  await Account.findOne({ aUsername: "admin" }, async (err, acc) => {
    if (!acc) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash("123123", salt);
      let adminRole = await Role.findOne({ rName: "Quản lý" });
      let newAcc = new Account({
        aUsername: "admin",
        aPassword: hashPassword,
        rId: adminRole._id,
      });
      let accSaved = await newAcc.save();
      let newStaff = new Staff({
        aId: accSaved._id,
        sJoinAt: new Date(),
        sState: true,
      });
      await newStaff.save();
    }
  });
};

module.exports.index = async (req, res) => {
  const title = "Đăng nhập";
  const username = req.session?.username || null;
  const errMessage = req.session?.errMessage || null;
  const messages = req.session?.messages || null;
  checkDB();
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
    const accFound = await Account.findOne({
      aUsername: req.body.username,
    }).populate("rId");
    if (!accFound) {
      redirectFunc("Tài khoản không tồn tại!", "/login-staff");
      return;
    }
    const isCorrectPassword = await bcrypt.compare(
      req.body.password,
      accFound.aPassword
    );
    if (!isCorrectPassword) {
      redirectFunc("Mật khẩu không đúng!", "/login-staff");
      return;
    }
    // đúng user
    let staff = await Staff.findOne({ aId: accFound._id }, "_id sState");
    if (!staff) {
      redirectFunc(
        "Bạn không có quyền truy cập chức năng này!",
        "/login-staff"
      );
      return;
    }
    let user = {
      _id: accFound._id,
      aUsername: accFound.aUsername,
      aPassword: accFound.aPassword,
      rId: accFound.rId,
      sId: staff._id,
      sState: staff.sState,
    };
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

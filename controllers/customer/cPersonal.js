const Account = require("../../models/mAccount");
const Customer = require("../../models/mCustomer");
const Category = require("../../models/mCategory");
const Shopinfo = require("../../models/mShopInfo");
const bcrypt = require("bcrypt");
const pI = { title: "Thông tin cá nhân", url: "personal" };
const rootRoute = `/${pI.url}`;
const imgPreviewSize = 350;
let shopinfo;
let menubar = [];

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

let GetDataDisplay = async () => {
  menubar = [];
  shopinfo = await Shopinfo.findOne({});
  //#region menubar
  let categories = await Category.find({}).sort({ pcName: "asc" }).populate({
    path: "rtId",
    select: "rtName slugName",
  });
  categories.map((pc) => {
    let index = menubar.findIndex((mb) => mb.title == pc.rtId.rtName);
    if (index == -1) {
      menubar.push({
        title: pc.rtId.rtName,
        url: "/" + pc.rtId.slugName,
        pcs: [{ title: pc.pcName, url: "/" + pc.slugName }],
      });
    } else {
      menubar[index].pcs.push({
        title: pc.pcName,
        url: "/" + pc.slugName,
      });
    }
  });
  menubar.sort((first, second) => (first.title > second.title ? 1 : -1));
  //#endregion
};

module.exports.index = async (req, res) => {
  const messages = req.session?.messages || null;
  const sess = req.session.user;
  req.session.messages = null;
  await GetDataDisplay();
  let customer = await Customer.findOne({ aId: sess._id }).populate({
    path: "aId",
    select: "aUsername rId",
  });
  let dofb = customer.cDofB ? JSON.stringify(customer.cDofB) : "";
  let personal = {
    cImg: customer.cImg,
    _id: customer._id,
    cName: customer.cName,
    cDofB: dofb?.slice(1, 11) || "",
    cNumber: customer.cNumber,
    cEmail: customer.cEmail,
    aId: customer.aId,
  };
  res.render(`./customer/${pI.url}`, {
    pI,
    messages,
    sess,
    shopinfo,
    menubar,
    imgPreviewSize,
    personal,
  });
};

module.exports.update = async (req, res) => {
  const sess = req.session.user;
  let updCustomer = {
    cName: req.body.cName.trim(),
    cDofB: req.body.cDofB,
    cNumber: req.body.cNumber,
    cEmail: req.body.cEmail,
  };

  if (updCustomer.cDofB != "") {
    let ns = new Date(updCustomer.cDofB);
    if (!(ns > 0)) {
      redirectFunc(false, "Ngày sinh không hợp lệ!", rootRoute, req, res);
      return;
    } else if (new Date().getFullYear() - updCustomer.cDofB.slice(0, 4) < 18) {
      redirectFunc(false, "Chưa đủ 18 tuổi!", rootRoute, req, res);
      return;
    }
  }

  if (updCustomer.cEmail.length != 0) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(String(updCustomer.cEmail).toLowerCase())) {
      redirectFunc(false, "Email không hợp lệ!", rootRoute, req, res);
      return;
    }

    const cFound = await Customer.findOne({
      cEmail: updCustomer.cEmail,
      aId: { $ne: sess._id },
    });
    if (cFound) {
      redirectFunc(false, "Email đã tồn tại!", rootRoute, req, res);
      return;
    }
  }
  let cImg = req.file?.filename || false;
  if (cImg) {
    updCustomer.cImg = cImg;
  }
  try {
    await Customer.findOneAndUpdate({ aId: sess._id }, { $set: updCustomer });
    redirectFunc(true, "Cập nhật thành công!", rootRoute, req, res);
  } catch (error) {
    redirectFunc(false, "Cập nhật thất bại!", rootRoute, req, res);
  }
};

module.exports.changePassword = async (req, res) => {
  const sess = req.session.user;
  Account.findById(sess._id, async (err, accFound) => {
    if (err) {
      redirectFunc(false, "Không tìm thấy tài khoản!", rootRoute, req, res);
    } else {
      const isCorrectPassword = await bcrypt.compare(
        req.body.oldPassword,
        accFound.aPassword
      );
      if (!isCorrectPassword) {
        redirectFunc(false, "Mật khẩu cũ không đúng!", rootRoute, req, res);
        return;
      } else {
        const salt = await bcrypt.genSalt(10);
        const aPassword = await bcrypt.hash(req.body.newPassword, salt);
        let updAcc = { aPassword };
        try {
          let accSave = await Account.findByIdAndUpdate(sess._id, {
            $set: updAcc,
          });
          redirectFunc(true, "Đổi mật khẩu thành công!", rootRoute, req, res);
        } catch (error) {
          redirectFunc(false, "Đổi mật khẩu thất bại!", rootRoute, req, res);
        }
      }
    }
  });
  return;
};

const Appointment = require("../../models/mAppointment");
const Customer = require("../../models/mCustomer");
const pI = { title: "Quản lý lịch hẹn", url: "appointmentM" };
const rootRoute = `/${pI.url}`;
const PAGE_SIZE = 10;
Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
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

module.exports.index = async (req, res) => {
  const messages = req.session?.messages || null;
  const sess = req.session.user;
  req.session.messages = null;
  //#region pagination
  let pageNum = Math.max(req.query.pnum || 1, 1);
  let skipPage = (pageNum - 1) * PAGE_SIZE;
  let totalApp = await Appointment.countDocuments();
  let totalPage = Math.ceil(totalApp / PAGE_SIZE);
  //#endregion

  let appointments = await Appointment.find({})
    .sort({ apTime: "desc" })
    .skip(skipPage)
    .limit(PAGE_SIZE)
    .populate({
      path: "scId",
      select: "sName",
    })
    .populate({
      path: "suId",
      select: "sName",
    })
    .populate("cId");
  res.render(`./staff/${pI.url}`, {
    pI,
    messages,
    appointments,
    sess,
    pageNum,
    totalApp,
    totalPage,
    pageSize: PAGE_SIZE,
  });
};

module.exports.add = async (req, res) => {
  const sess = req.session?.user;
  let newApp = new Appointment({
    apTime: req.body.apTime,
    apLocation: req.body.apLocation.trim(),
    cId: req.body.cId,
    scId: sess.sId,
  });
  let apTime = new Date(req.body.apTime);
  let curTime = new Date();
  if (apTime == "Invalid Date")
    redirectFunc(false, "Thời gian không hợp lệ!", rootRoute, req, res);
  else if (apTime.getTime() < curTime.getTime())
    redirectFunc(false, "Thời gian không hợp lệ!", rootRoute, req, res);
  else if (newApp.apLocation.length == 0)
    redirectFunc(false, "Địa điểm là bắt buộc!", rootRoute, req, res);
  else if (newApp.apLocation.length > 255)
    redirectFunc(false, "Địa điểm tối đa 255 ký tự!", rootRoute, req, res);
  else {
    await newApp.save();
    redirectFunc(true, "Thêm lịch hẹn thành công!", rootRoute, req, res);
  }
};

module.exports.update = async (req, res) => {
  const sess = req.session?.user;
  await Appointment.findById(req.body.id, async (err, app) => {
    if (!app)
      redirectFunc(false, "Lịch hẹn không tồn tại!", rootRoute, req, res);
    else {
      app.apLocation = req.body.apLocation.trim();
      app.cId = req.body.cId;
      app.suId = sess.sId;

      let apTime = new Date(req.body.apTime);
      let curTime = new Date();
      if (apTime == "Invalid Date")
        redirectFunc(false, "Thời gian không hợp lệ!", rootRoute, req, res);
      else if (apTime.getTime() < curTime.getTime())
        redirectFunc(false, "Thời gian không hợp lệ!", rootRoute, req, res);
      else if (app.apLocation.length == 0)
        redirectFunc(false, "Địa điểm là bắt buộc!", rootRoute, req, res);
      else if (app.apLocation.length > 255)
        redirectFunc(false, "Địa điểm tối đa 255 ký tự!", rootRoute, req, res);
      else if (app.apResult)
        redirectFunc(
          false,
          "Không thể sửa lịch đã có kết quả!",
          rootRoute,
          req,
          res
        );
      else {
        app.apTime = req.body.apTime;
        await app.save();
        redirectFunc(
          true,
          "Cập nhật lịch hẹn thành công!",
          rootRoute,
          req,
          res
        );
      }
    }
  });
};
module.exports.updres = async (req, res) => {
  const sess = req.session?.user;
  await Appointment.findById(req.body.id, async (err, app) => {
    if (!app)
      redirectFunc(false, "Lịch hẹn không tồn tại!", rootRoute, req, res);
    else {
      app.apResult = req.body.apResult.trim();
      app.suId = sess.sId;
      if (app.apResult.length == 0)
        redirectFunc(false, "Địa điểm là bắt buộc!", rootRoute, req, res);
      else if (app.apResult.length > 255)
        redirectFunc(false, "Địa điểm tối đa 255 ký tự!", rootRoute, req, res);
      else {
        await app.save();
        redirectFunc(
          true,
          "Cập nhật lịch hẹn thành công!",
          rootRoute,
          req,
          res
        );
      }
    }
  });
};

module.exports.delete = async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id, function (err) {
    req.session.messages = {
      icon: !err ? "check-circle" : "alert-circle",
      color: !err ? "success" : "danger",
      title: !err ? "Thành công!" : "Thất bại",
      text: !err ? "Xóa lịch hẹn thành công!" : "Xóa lịch hẹn thất bại!",
    };
    res.json(!err);
  });
};

module.exports.find = async (req, res) => {
  let keyword = req.body.keyword;
  Customer.find({ cName: new RegExp(keyword, "i") }, async (err, cByName) => {
    if (cByName.length == 0) {
      Customer.find(
        { cNumber: new RegExp(keyword, "i") },
        async (err, cByNumber) => {
          res.json(cByNumber);
        }
      );
    } else res.json(cByName);
  });
};

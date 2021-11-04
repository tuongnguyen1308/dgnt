//#region REQUIRED PAKAGE
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const path = require("path");
const mwAuthS = require("./middlewares/mwAuthS");
const mwAuthC = require("./middlewares/mwAuthC");
const provinces = require("./data/provinces.json");
require("dotenv/config");
//#endregion

//#region INIT
const app = express();
app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("trust proxy", 1);
app.use(
  session({
    name: process.env.SESS_NAME,
    cookie: {
      maxAge: 86400000,
      sameSite: false,
      secure: process.env.NODE_ENV === "production",
    },
    store: MongoStore.create({
      mongoUrl: process.env.DB_CONNECTION2,
      ttl: 14 * 24 * 60 * 60,
    }),
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
//#endregion

//#region DB_CONNECTION2
mongoose.connect(
  process.env.DB_CONNECTION2,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (err) => {
    console.log(err || "Database connected!");
  }
);
//#endregion

//#region ROUTERS
app.get("/order-result", (req, res) => {
  res.redirect("/order");
});

const sLoginR = require("./routes/staff/rLogin");
const sDashboardR = require("./routes/staff/rDashboard");
const sListR = require("./routes/staff/rStaff");
const sProfileR = require("./routes/staff/rProfile");
const sAboutR = require("./routes/staff/rAbout");
const sMaterialR = require("./routes/staff/rMaterial");
const sMtrreqR = require("./routes/staff/rMtrreq");
const sMtrbatchR = require("./routes/staff/rMtrbatch");
const sProductMnmR = require("./routes/staff/rProductManagement");
const sRoomtypeR = require("./routes/staff/rRoomtype");
const sCategoryR = require("./routes/staff/rCategory");
const sProductRoute = require("./routes/staff/rProduct");
const sPrdreqRoute = require("./routes/staff/rPrdreq");
const sAppointmentMR = require("./routes/staff/rAppointmentM");
const sOrderMR = require("./routes/staff/rOrderM");
const sReviewR = require("./routes/staff/rReview");

const cHomeR = require("./routes/customer/rHome");
const cCustomerR = require("./routes/customer/rCustomer");
const cPersonalR = require("./routes/customer/rPersonal");
const cCartR = require("./routes/customer/rCart");
const cDAR = require("./routes/customer/rDA");
const cPrepareOrderR = require("./routes/customer/rPrepareOrder");
const cOrderR = require("./routes/customer/rOrder");

//#region db
app.get("/provinces", (req, res) => {
  res.send(provinces);
});
//#endregion

//#region staff
app.use("/dashboard", mwAuthS.Auth, sDashboardR);
// quan ly tai khoan
app.use("/login-staff", sLoginR);
app.use("/staff", mwAuthS.Auth, sListR);
app.use("/profile", mwAuthS.Auth, sProfileR);
// quan ly danh muc
app.use("/about", mwAuthS.Auth, sAboutR);
// quan ly nvl
app.use("/material", mwAuthS.Auth, sMaterialR);
app.use("/mtrreq", mwAuthS.Auth, sMtrreqR);
app.use("/mtrbatch", mwAuthS.Auth, sMtrbatchR);
// quan ly sp
app.use("/product-management", mwAuthS.Auth, sProductMnmR);
app.use("/roomtype", mwAuthS.Auth, sRoomtypeR);
app.use("/category", mwAuthS.Auth, sCategoryR);
app.use("/product", mwAuthS.Auth, sProductRoute);
app.use("/prdreq", mwAuthS.Auth, sPrdreqRoute);
// quản lý lịch hẹn
app.use("/appointmentM", mwAuthS.Auth, sAppointmentMR);
// quản lý đơn hàng
app.use("/orderM", mwAuthS.Auth, sOrderMR);
// quản lý đánh giá
app.use("/review", mwAuthS.Auth, sReviewR);
//#endregion

//#region customber
app.use("/customer", cCustomerR);
app.use("/personal", mwAuthC.Auth, cPersonalR);
app.use("/cart", mwAuthC.Auth, cCartR);
app.use("/da", mwAuthC.Auth, cDAR);
app.use("/prepare-order", mwAuthC.Auth, cPrepareOrderR);
app.use("/order", mwAuthC.Auth, cOrderR);
app.use("/", cHomeR);
//#endregion
//#endregion

app.listen(process.env.PORT, () => console.log("Server started!"));

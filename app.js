//#region REQUIRED PAKAGE
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const mwAuthS = require("./middlewares/mwAuthS");
const mwAuthC = require("./middlewares/mwAuthC");
require("dotenv/config");
//#endregion

//#region INIT
const app = express();
app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    name: process.env.SESS_NAME,
    cookie: {
      maxAge: 7200000,
      sameSite: true,
      secure: process.env.NODE_ENV === "production",
    },
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
//#endregion

//#region DB_CONNECTION
mongoose.connect(
  process.env.DB_CONNECTION,
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
// app.get("/", (req, res) => {
//   res.render("home", {
//     title: "Trang chủ",
//   });
// });

const sLoginR = require("./routes/staff/rLogin");
const sDashboardR = require("./routes/staff/rDashboard");
const sListR = require("./routes/staff/rStaff");
const sProfileR = require("./routes/staff/rProfile");
const sAboutR = require("./routes/staff/rAbout");

const productTypeRoute = require("./routes/staff/rProductType");
const productsRoute = require("./routes/staff/rProducts");

const cHomeR = require("./routes/customer/rHome");
const cLoginR = require("./routes/customer/rLogin");
const cPersonalR = require("./routes/customer/rPersonal");
const cAboutR = require("./routes/customer/rAbout");

app.use("/login-staff", sLoginR);
app.use("/dashboard", mwAuthS.Auth, sDashboardR);
app.use("/staff", mwAuthS.Auth, sListR);
app.use("/profile", mwAuthS.Auth, sProfileR);
app.use("/about", mwAuthS.Auth, sAboutR);

app.use("/product-type", mwAuthS.Auth, productTypeRoute);
app.use("/products", mwAuthS.Auth, productsRoute);

app.use("/", cHomeR);
app.use("/login", cLoginR);
app.use("/personal", mwAuthC.Auth, cPersonalR);

app.use("/shop-about", cAboutR);

//#endregion

app.listen(process.env.PORT, () => console.log("Server started!"));

//#region REQUIRED PAKAGE
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const mwAuth = require("./middlewares/mwAuthS");
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
app.get("/", (req, res) => {
  res.render("home", {
    title: "Trang chủ",
  });
});

const staffLoginRoute = require("./routes/staff/rLogin");
const dashboardRoute = require("./routes/staff/rDashboard");
const staffListRoute = require("./routes/staff/rStaff");
const productTypeRoute = require("./routes/staff/rProductType");
const productsRoute = require("./routes/staff/rProducts");

app.use("/dashboard", mwAuth.Auth, dashboardRoute);
app.use("/staff", mwAuth.Auth, staffListRoute);
app.use("/product-type", mwAuth.Auth, productTypeRoute);
app.use("/products", mwAuth.Auth, productsRoute);
app.use("/login-staff", staffLoginRoute);

//#endregion

app.listen(process.env.PORT, () => console.log("Server started!"));

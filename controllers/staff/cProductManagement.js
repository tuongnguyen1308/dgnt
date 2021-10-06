const Product = require("../../models/mProduct");
const Roomtype = require("../../models/mRoomtype");
const Category = require("../../models/mCategory");
const Prdreq = require("../../models/mPrdreq");
const Material = require("../../models/mMaterial");
const pI = { title: "Quản lý sản phẩm", url: "product" };

module.exports.index = async (req, res) => {
  const messages = req.session?.messages || null;
  const sess = req.session.user;
  req.session.messages = null;
  let roomtypes = await Roomtype.find({}).sort({ rtName: "asc" }).populate({
    path: "sId",
    select: "sName",
  });
  let categories = await Category.find({})
    .sort({ pcName: "asc" })
    .populate({
      path: "sId",
      select: "sName",
    })
    .populate({
      path: "rtId",
      select: "rtName",
    });
  // roomtype can't be delete
  let rt_cbd = new Set();
  categories.map((pc) => {
    rt_cbd.add(pc.rtId._id);
  });
  rt_cbd = [...rt_cbd].join(" ");
  // filter/search
  let con = {};
  let rtSelected = req.query?.prdRoom || -1;
  let pcSelected = req.query?.prdCate || -1;
  if (rtSelected != -1 && pcSelected == -1) {
    let pcIds = categories
      .filter((c) => c.rtId._id == rtSelected)
      .map((c) => c._id);
    con.pcId = { $in: pcIds };
  } else if (pcSelected != -1) con.pcId = pcSelected;
  let keyword = req.query?.productName || "";
  if (keyword) con.pName = new RegExp(keyword, "i");
  // find products with condition
  let products = await Product.find(con).sort({ pName: "asc" }).populate({
    path: "sId",
    select: "sName",
  });
  // roomtype can't be delete
  let pc_cbd = new Set();
  products.map((p) => {
    pc_cbd.add(p.pcId._id);
  });
  pc_cbd = [...pc_cbd].join(" ");
  let mtrs = await Material.find({}).sort({ mName: "asc" });
  // get product-request
  let prdreqs = await Prdreq.find({})
    .sort({ prDeadlineAt: "desc" })
    .populate({
      path: "prDetail.pId",
      select: "pName pUnit pImgs",
    })
    .populate({
      path: "scId",
      select: "sName",
    })
    .populate({
      path: "suId",
      select: "sName",
    });
  // product can't be delete
  let p_cbd = new Set();
  prdreqs.map((prdreq) => {
    prdreq.prDetail.map((p) => {
      p_cbd.add(p.pId._id);
    });
  });
  p_cbd = [...p_cbd].join(" ");
  res.render(`./staff/${pI.url}`, {
    pI,
    messages,
    roomtypes,
    categories,
    rt_cbd,
    pc_cbd,
    products,
    mtrs,
    rtSelected,
    pcSelected,
    keyword,
    prdreqs,
    p_cbd,
    sess,
  });
};

const Product = require("../../models/mProduct");
const Roomtype = require("../../models/mRoomtype");
const Category = require("../../models/mCategory");
// const Mtrreq = require("../../models/mMtrreq");
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
  let rt_cbd = new Set();
  categories.map((pc) => {
    rt_cbd.add(pc.rtId._id);
  });
  rt_cbd = [...rt_cbd].join(" ");
  let keyword = req.query?.productName || "";
  let products = await Product.find({
    pName: new RegExp(keyword, "i"),
  })
    .sort({ pName: "asc" })
    .populate({
      path: "sId",
      select: "sName",
    });
  let mtrs = await Material.find({}).sort({ mName: "asc" });

  // let mtrreqs = await Mtrreq.find({})
  //   .sort({ createdAt: "desc" })
  //   .populate({
  //     path: "mrDetail.mId",
  //     select: "pName mUnit mImg",
  //   })
  //   .populate({
  //     path: "scId",
  //     select: "sName",
  //   })
  //   .populate({
  //     path: "suId",
  //     select: "sName",
  //   });
  // mtrreqs = mtrreqs.map((mtr) => {
  //   let ca = mtr.createdAt;
  //   let ua = mtr.updatedAt;
  //   mtr.createdAt = ca.setUTCHours(ca.getUTCHours() + 7);
  //   mtr.updatedAt = ua.setUTCHours(ua.getUTCHours() + 7);
  //   return mtr;
  // });
  res.render(`./staff/${pI.url}`, {
    pI,
    messages,
    roomtypes,
    categories,
    rt_cbd,
    products,
    mtrs,
    keyword,
    // mtrreqs,
    sess,
  });
};

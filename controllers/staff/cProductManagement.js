const Product = require("../../models/mProduct");
const Roomtype = require("../../models/mRoomtype");
const Category = require("../../models/mCategory");
const Prdreq = require("../../models/mPrdreq");
const Material = require("../../models/mMaterial");
const pI = { title: "Quản lý sản phẩm", url: "product" };
const PAGE_SIZE = 10;

module.exports.index = async (req, res) => {
  const messages = req.session?.messages || null;
  const sess = req.session.user;
  req.session.messages = null;
  //#region pagination
  let pageNum = Math.max(req.query.pnum || 1, 1);
  let pageNumP = 1;
  let skipPageP = (pageNumP - 1) * PAGE_SIZE;
  let totalP = await Product.countDocuments();
  let totalPP = Math.ceil(totalP / PAGE_SIZE);
  // req
  let pageNumR = 1;
  let skipPageR = (pageNumR - 1) * PAGE_SIZE;
  let totalR = await Prdreq.countDocuments();
  let totalRP = Math.ceil(totalR / PAGE_SIZE);
  switch (req.query.pname) {
    case "prd":
      pageNumP = pageNum;
      skipPageP = (pageNumP - 1) * PAGE_SIZE;
      break;
    case "req":
      pageNumR = pageNum;
      skipPageR = (pageNumR - 1) * PAGE_SIZE;
      break;
  }
  //#endregion
  let roomtypes = await Roomtype.find({}).sort({ createdAt: "desc" }).populate({
    path: "sId",
    select: "sName",
  });
  let categories = await Category.find({})
    .sort({ createdAt: "desc" })
    .populate({
      path: "sId",
      select: "sName",
    })
    .populate({
      path: "rtId",
      select: "rtName",
    });
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
  let products = await Product.find(con)
    .sort({ createdAt: "desc" })
    .skip(skipPageP)
    .limit(PAGE_SIZE)
    .populate({
      path: "sId",
      select: "sName",
    })
    .populate({
      path: "mConsume.mId",
    });
  // get product-request
  let prdreqs = await Prdreq.find({})
    .sort({ prDeadlineAt: "desc", createdAt: "desc" })
    .skip(skipPageR)
    .limit(PAGE_SIZE)
    .populate({
      path: "prDetail.pId",
      select: "pName pUnit pImgs mConsume",
      populate: "mConsume.mId",
    })
    .populate({
      path: "scId",
      select: "sName",
    })
    .populate({
      path: "suId",
      select: "sName",
    });
  res.render(`./staff/${pI.url}`, {
    pI,
    messages,
    roomtypes,
    categories,
    products,
    rtSelected,
    pcSelected,
    keyword,
    prdreqs,
    sess,
    pageNumP,
    pageNumR,
    totalP,
    totalR,
    totalPP,
    totalRP,
    pageSize: PAGE_SIZE,
  });
};
